# e-payment

payment service using Stripe.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy '*'`      deploy all stack to your default AWS account/region
* `cdk deploy InfraInitStack`      deploy InfraInitStack to your default AWS account/region
* `cdk deploy EPaymentStack`      deploy EPaymentStack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

## Stack

* InfraInitStack: 初回構築時のみデプロイするスタック
* EPaymentStack: LambdaとStepFunctionsをデプロイするスタック
