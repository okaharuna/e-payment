import { Context } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import Stripe from 'stripe'
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const secretsManager = new AWS.SecretsManager()
const cache: StripeSecret | undefined = undefined
let stripe: Stripe | undefined = undefined

interface Payment {
    user_id: string
    amount: number
}

interface StripeSecret {
    api_key: string
}

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

const CreatePayment = async (amount: number) => {
    // Stripe 決済
    const stripe = await getStripe()
    const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'JPY',
        payment_method_types: ['card'],
    })
    return paymentIntent
}

export const handler = async (
    event: Payment,
    context: Context
): Promise<Stripe.PaymentIntent> => {
    console.info({ event })
    console.info({ context })
    const result = CreatePayment(event.amount)
    return result
}
