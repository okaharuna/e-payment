import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'
import * as sfn from '@aws-cdk/aws-stepfunctions'
import * as tasks from '@aws-cdk/aws-stepfunctions-tasks'
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs'
import { Role } from '@aws-cdk/aws-iam'

// const USER_TABLE_NAME = 'Users'
// const PAYMENT_TABLE_NAME = 'Payments'

interface InfraInitStackProps extends cdk.StackProps {
    lambdaCommonRole: Role
}

export class EPaymentStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props: InfraInitStackProps) {
        super(scope, id, props)

        /**
         * Lambda
         */

        const checkUserData = new NodejsFunction(this, 'CheckUserDataFn', {
            functionName: 'CheckUserData',
            runtime: lambda.Runtime.NODEJS_12_X,
            entry: 'src/functions/check_user_data/index.ts',
            handler: 'handler',
            role: props.lambdaCommonRole,
        })

        const createPayment = new NodejsFunction(this, 'CreatePaymentFn', {
            functionName: 'CreatePayment',
            runtime: lambda.Runtime.NODEJS_12_X,
            entry: 'src/functions/create_payment/index.ts',
            handler: 'handler',
            role: props.lambdaCommonRole,
        })

        const checkPayment = new NodejsFunction(this, 'CheckPaymentFn', {
            functionName: 'CheckPayment',
            runtime: lambda.Runtime.NODEJS_12_X,
            entry: 'src/functions/check_payment/index.ts',
            handler: 'handler',
            role: props.lambdaCommonRole,
        })

        const notifyPayment = new NodejsFunction(this, 'NotifyFn', {
            functionName: 'Notify',
            runtime: lambda.Runtime.NODEJS_12_X,
            entry: 'src/functions/notify_payment/index.ts',
            handler: 'handler',
            role: props.lambdaCommonRole,
        })

        const paymentFallback = new NodejsFunction(this, 'PaymentFallbackFn', {
            functionName: 'PaymentFallback',
            runtime: lambda.Runtime.NODEJS_12_X,
            entry: 'src/functions/fallback_payment/index.ts',
            handler: 'handler',
            role: props.lambdaCommonRole,
        })

        const confirmPayment = new NodejsFunction(this, 'ConfirmPaymentFn', {
            functionName: 'ConfirmPayment',
            runtime: lambda.Runtime.NODEJS_12_X,
            entry: 'src/functions/confirm_payment/index.ts',
            handler: 'handler',
            role: props.lambdaCommonRole,
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
        const createPaymentTask = new tasks.LambdaInvoke(
            this,
            'CreatePayment',
            {
                lambdaFunction: createPayment,
            }
        )
        const waitForConfirmPayment = new sfn.Wait(
            this,
            'WaitForConfirmPayment',
            {
                time: sfn.WaitTime.secondsPath('$.refund_time_sec'),
            }
        )
        const confirmPaymentTask = new tasks.LambdaInvoke(
            this,
            'ConfirmPayment',
            {
                lambdaFunction: confirmPayment,
            }
        )

        const fallbackTask = new tasks.LambdaInvoke(this, 'Fallback', {
            lambdaFunction: paymentFallback,
        })

        createPaymentTask.next(waitForConfirmPayment).next(
            confirmPaymentTask.addCatch(fallbackTask, {
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
                createPaymentTask
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
