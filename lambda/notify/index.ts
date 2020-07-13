import { Context } from 'aws-lambda';
import * as AWS from 'aws-sdk';
const dynamoDB = new AWS.DynamoDB.DocumentClient();

interface Payment {
    user_id: string;
    amount: number;
}

export const handler = async (event: Payment, context: Context): Promise <any> => {
    console.info({event});
    console.info({context});
    // TODO
    const result: any = { result: 'OK' };
    return result;
};