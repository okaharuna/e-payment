import * as AWS from 'aws-sdk'
import { User, QueryOptions } from './types'

export class Users {
    private dynamoDB = new AWS.DynamoDB.DocumentClient()
    async put(user: User): Promise<User> {
        const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
            TableName: 'Users',
            Item: user,
            ConditionExpression: 'attribute_exists(user_id)',
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
}
