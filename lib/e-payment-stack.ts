import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as sfn from '@aws-cdk/aws-stepfunctions';
import * as tasks from '@aws-cdk/aws-stepfunctions-tasks';
import { Secret } from '@aws-cdk/aws-secretsmanager';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import * as iam from '@aws-cdk/aws-iam';
const USER_TABLE_NAME = 'Users';
const PAYMENT_TABLE_NAME = 'Payments';

export class EPaymentStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda
    // const CheckUserData = new lambda.Function(this, 'CheckUserDataFn', {
    //   functionName: 'CheckUserData',
    //   runtime: lambda.Runtime.NODEJS_12_X,
    //   code: lambda.Code.fromAsset('dist/lambda/check_user_data'),
    //   handler: 'index.handler'
    // });

    const CheckUserData = new NodejsFunction(this, 'CheckUserDataFn', {
      functionName: 'CheckUserData',
      runtime: lambda.Runtime.NODEJS_12_X,
      entry: 'lambda/check_user_data/index.ts',
      handler: "handler"
    });


    const StripeCharge = new NodejsFunction(this, 'StripeChargeFn', {
      functionName: 'StripeCharge',
      runtime: lambda.Runtime.NODEJS_12_X,
      entry: 'lambda/stripe_charge/index.ts',
      handler: 'handler'
    });

    const Notify = new NodejsFunction(this, 'NotifyFn', {
      functionName: 'Notify',
      runtime: lambda.Runtime.NODEJS_12_X,
      entry: 'lambda/notify/index.ts',
      handler: 'handler'
    });

    // Step function
    const task = new tasks.LambdaInvoke(this, 'CheckUserData', {
      lambdaFunction: CheckUserData
    });
    const choice = new sfn.Choice(this, 'ChoicePaymentMethod');
    choice.when(sfn.Condition.stringEquals('$.payment_method', 'stripe'), new tasks.LambdaInvoke(this, 'StripeCharge', {
      lambdaFunction: StripeCharge
    }));
    choice.otherwise(new tasks.LambdaInvoke(this, 'Notify', {
      lambdaFunction: Notify
    }));

    const definition = task.next(choice);
    new sfn.StateMachine(this, 'Payment', { definition });

  }
}
