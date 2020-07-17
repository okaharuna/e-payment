import { Context } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import { Payment } from '../../shared/types'
const dynamoDB = new AWS.DynamoDB.DocumentClient()

export const handler = async (
    event: Payment,
    context: Context
): Promise<any> => {
    console.info({ event })
    console.info({ context })
    // TODO
    const result: any = { result: 'OK' }
    return result
}
