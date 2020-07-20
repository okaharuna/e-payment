import { Context } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import Stripe from 'stripe'
import { PaymentStripe, StripeSecret, User } from '../../shared/types'
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const secretsManager = new AWS.SecretsManager()
let stripe: Stripe | undefined = undefined

const getSecret = async (secretName: string): Promise<StripeSecret> => {
    const secretValue = await secretsManager
        .getSecretValue({
            SecretId: secretName,
        })
        .promise()
    if (secretValue.SecretString === undefined)
        throw new Error('Secret is not found.')
    console.log({ secretValue })
    return JSON.parse(secretValue.SecretString) as StripeSecret
}

const getStripe = async (): Promise<Stripe> => {
    if (stripe) return stripe
    const secret = await getSecret('Stripe')
    stripe = new Stripe(secret.api_key, { apiVersion: '2020-03-02' })
    return stripe
}

const createCustomer = async (paymentMethod: string) => {
    /** Stripeにカスタマー登録 */
    const stripe = await getStripe()
    const customer = await stripe.customers.create({
        email: 'jenny.rosen@example.com',
        payment_method: paymentMethod,
        invoice_settings: {
            default_payment_method: paymentMethod,
        },
    })
}

const registerCard = async (customerId: string, paymentMethod: string) => {
    /** カスタマーにカードを登録 */
    const stripe = await getStripe()

    const card = await stripe.paymentMethods.attach(paymentMethod, {
        customer: customerId,
    })
}

const updateUser = async (userId: string, paymentMethod: string) => {
    // Dynamo Usersテーブル更新
    const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
        TableName: 'Users',
        Key: { userId },
        UpdateExpression: `SET paymentMethod = :paymentMethod`,
        ExpressionAttributeValues: {
            ':paymentMethod': paymentMethod,
        },
    }
    await dynamoDB.update(params).promise()
}

export const handler = async (
    event: PaymentStripe,
    context: Context
): Promise<void> => {
    console.info({ event })
    console.info({ context })
    const result = await createCustomer(event.payment_method)
    return result
}
