import * as AWS from 'aws-sdk'
import { User, QueryOptions } from './types'

export class Users {
    private dynamoDB = new AWS.DynamoDB.DocumentClient()
    async put(user: User): Promise<User> {
        const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
            TableName: 'Users',
            Item: user,
            ConditionExpression: 'attribute_exists(userId)',
        }
        console.info({ params })
        const result = await this.dynamoDB.put(params).promise()
        console.info({ result })
        return result.Attributes as User
    }

    async get(
        userId: string,
        opts: QueryOptions = {}
    ): Promise<User | undefined> {
        const consistentRead =
            opts.consistentRead !== undefined ? opts.consistentRead : false
        const params: AWS.DynamoDB.DocumentClient.GetItemInput = {
            TableName: 'Users',
            Key: { userId },
            ConsistentRead: consistentRead,
        }
        console.info({ params })
        const result = await this.dynamoDB.get(params).promise()
        console.info({ result })
        if (result.Item === undefined) return undefined
        return result.Item as User
    }

    async updateCard(
        userId: string,
        paymentMethod: string,
        stripeCustomerId?: string
    ): Promise<User> {
        const attValues: AWS.DynamoDB.DocumentClient.ExpressionAttributeValueMap = {
            ':paymentMethod': paymentMethod,
        }
        const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
            TableName: `Users`,
            Key: { userId },
            UpdateExpression: 'SET stripePaymentMethod = :paymentMethod,',
            ReturnValues: 'ALL_NEW',
        }
        if (stripeCustomerId) {
            params.UpdateExpression += 'stripeCustomerId = :stripeCustomerId'
            attValues[':stripeCustomerId'] = stripeCustomerId
        }
        params.ExpressionAttributeValues = attValues
        console.info({ params })
        const res = await this.dynamoDB.update(params).promise()
        console.info({ res })
        return res.Attributes as User
    }
}
