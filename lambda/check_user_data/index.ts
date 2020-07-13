import { Context } from 'aws-lambda';
import * as AWS from 'aws-sdk';
const dynamoDB = new AWS.DynamoDB.DocumentClient();

interface Payment {
    user_id: string;
    amount: number;
}

interface Response {
    user_id: string;
    amount: number;
    payment_method: 'stripe' | 'other';
}

export const handler = async (event: Payment, context: Context): Promise <Response> => {
    console.info({event});
    console.info({context});
    // TODO
    const result: any = event;
    result.payment_method = 'stripe';
    return result;
};