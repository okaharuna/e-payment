import * as cdk from '@aws-cdk/core'
import { Secret } from '@aws-cdk/aws-secretsmanager'
import * as iam from '@aws-cdk/aws-iam'

export class InfraInitStack extends cdk.Stack {
    static lambdaCommonRole: iam.Role

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const StripeSecret = new Secret(this, id, {
            secretName: 'Stripe',
        })

        InfraInitStack.lambdaCommonRole = new iam.Role(
            this,
            'LambdaCommonRole',
            {
                assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
                description: 'Lambda common role used in e-payment.',
                roleName: 'lambda',
                path: '/e-payment/',
            }
        )

        InfraInitStack.lambdaCommonRole.addToPolicy(
            new iam.PolicyStatement({
                actions: [
                    'logs:CreateLogGroup',
                    'logs:CreateLogStream',
                    'logs:PutLogEvents',
                    'secretsmanager:GetSecretValue',
                ],
                resources: ['*'],
            })
        )
    }
}
