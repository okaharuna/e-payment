import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'
import * as sfn from '@aws-cdk/aws-stepfunctions'
import * as tasks from '@aws-cdk/aws-stepfunctions-tasks'
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs'
const USER_TABLE_NAME = 'Users'
const PAYMENT_TABLE_NAME = 'Payments'

export class EPaymentStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        /**
         * Lambda
         */

        const checkUserData = new NodejsFunction(this, 'CheckUserDataFn', {
            functionName: 'CheckUserData',
            runtime: lambda.Runtime.NODEJS_12_X,
            entry: 'lambda/check_user_data/index.ts',
            handler: 'handler',
        })

        const stripeCharge = new NodejsFunction(this, 'StripeChargeFn', {
            functionName: 'StripeCharge',
            runtime: lambda.Runtime.NODEJS_12_X,
            entry: 'lambda/stripe_charge/index.ts',
            handler: 'handler',
        })

        const checkPayment = new NodejsFunction(this, 'CheckPaymentFn', {
            functionName: 'CheckPayment',
            runtime: lambda.Runtime.NODEJS_12_X,
            entry: 'lambda/check_payment/index.ts',
            handler: 'handler',
        })

        const notifyPayment = new NodejsFunction(this, 'NotifyFn', {
            functionName: 'Notify',
            runtime: lambda.Runtime.NODEJS_12_X,
            entry: 'lambda/notify_payment/index.ts',
            handler: 'handler',
        })

        const paymentFallback = new NodejsFunction(this, 'PaymentFallbackFn', {
            functionName: 'PaymentFallback',
            runtime: lambda.Runtime.NODEJS_12_X,
            entry: 'lambda/fallback_payment/index.ts',
            handler: 'handler',
        })

        const stripeCapture = new NodejsFunction(this, 'StripeCaptureFn', {
            functionName: 'StripeCapture',
            runtime: lambda.Runtime.NODEJS_12_X,
            entry: 'lambda/stripe_capture/index.ts',
            handler: 'handler',
        })

        /**
         * Step function
         */

        const checkUserDataTask = new tasks.LambdaInvoke(
            this,
            'CheckUserData',
            {
                lambdaFunction: checkUserData,
            }
        )

        // 自動払いのフロー
        const stripeChargeTask = new tasks.LambdaInvoke(this, 'StripeCharge', {
            lambdaFunction: stripeCharge,
        })
        const waitForStripeCapture = new sfn.Wait(
            this,
            'WaitForStripeCapture',
            {
                time: sfn.WaitTime.secondsPath('$.refund_time_sec'),
            }
        )
        const stripeCaptureTask = new tasks.LambdaInvoke(
            this,
            'StripeCapture',
            {
                lambdaFunction: stripeCapture,
            }
        )

        const fallbackTask = new tasks.LambdaInvoke(this, 'Fallback', {
            lambdaFunction: paymentFallback,
        })

        stripeChargeTask.next(waitForStripeCapture).next(
            stripeCaptureTask.addCatch(fallbackTask, {
                errors: ['StripeError', 'States.Timeout'],
                resultPath: '$.error',
            })
        )

        // 後払いのフロー
        const notifyTask = new tasks.LambdaInvoke(this, 'Notify', {
            lambdaFunction: notifyPayment,
        })
        const waitForPayment = new sfn.Wait(this, 'WaitForPayment', {
            time: sfn.WaitTime.secondsPath('$.refund_time_sec'),
        })
        const checkPaymentTask = new tasks.LambdaInvoke(this, 'CheckPayment', {
            lambdaFunction: checkPayment,
        })
        notifyTask.next(waitForPayment).next(
            checkPaymentTask.addCatch(fallbackTask, {
                errors: ['NonPayment', 'States.Timeout'],
                resultPath: '$.error',
            })
        )

        // 自動払い or 後払いの分岐
        const choicePaymentMethod = new sfn.Choice(this, 'ChoicePaymentMethod')
            .when(
                sfn.Condition.stringEquals('$.payment_method', 'stripe'),
                stripeChargeTask
            )
            .otherwise(notifyTask)

        const definition = sfn.Chain.start(checkUserDataTask).next(
            choicePaymentMethod
        )
        new sfn.StateMachine(this, 'PaymentSfn', {
            definition,
            stateMachineName: 'Payment',
        })
    }
}
