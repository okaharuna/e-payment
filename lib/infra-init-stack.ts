import * as cdk from '@aws-cdk/core'
import { Secret } from '@aws-cdk/aws-secretsmanager'
import * as iam from '@aws-cdk/aws-iam'

export class InfraInitStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        const StripeSecret = new Secret(this, id, {
            secretName: 'Stripe',
        })

        const role = new iam.Role(this, 'LambdaCommonRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            description: 'Lambda common role used in e-payment.',
            roleName: 'lambda',
            path: '/e-payment/',
        })

        role.addToPolicy(
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
