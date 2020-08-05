import * as AWS from 'aws-sdk'
import { Payment } from './types'

export class Payments {
    private dynamoDB = new AWS.DynamoDB.DocumentClient()
    async create(payment: Payment): Promise<Payment> {
        const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
            TableName: 'Payments',
            Item: payment,
            ConditionExpression: 'attribute_not_exists(paymentId)',
        }
        console.info({ params })
        const result = await this.dynamoDB.put(params).promise()
        console.info({ result })
        return result.Attributes as Payment
    }

    async update(payment: Payment): Promise<Payment> {
        const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
            TableName: 'Payments',
            Item: payment,
            ConditionExpression: 'attribute_exists(paymentId)',
        }
        console.info({ params })
        const result = await this.dynamoDB.put(params).promise()
        console.info({ result })
        return result.Attributes as Payment
    }
}
