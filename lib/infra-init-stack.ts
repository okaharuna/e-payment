import * as cdk from '@aws-cdk/core'
import { Secret } from '@aws-cdk/aws-secretsmanager'
import * as iam from '@aws-cdk/aws-iam'
import * as dynamodb from '@aws-cdk/aws-dynamodb'

export class InfraInitStack extends cdk.Stack {
    static lambdaCommonRole: iam.Role

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        new Secret(this, id, {
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
                    'dynamodb:PutItem',
                    'dynamodb:DeleteItem',
                    'dynamodb:GetItem',
                    'dynamodb:Scan',
                    'dynamodb:Query',
                    'dynamodb:UpdateItem',
                ],
                resources: ['*'],
            })
        )

        new dynamodb.Table(this, 'UserTable', {
            tableName: 'Users',
            partitionKey: {
                name: 'userId',
                type: dynamodb.AttributeType.STRING,
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        })

        new dynamodb.Table(this, 'PaymentTable', {
            tableName: 'Payments',
            partitionKey: {
                name: 'storeCode',
                type: dynamodb.AttributeType.STRING,
            },
            sortKey: {
                name: 'paymentId',
                type: dynamodb.AttributeType.STRING,
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        })
    }
}
