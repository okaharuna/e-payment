import * as AWS from 'aws-sdk'
import Stripe from 'stripe'
// const dynamoDB = new AWS.DynamoDB.DocumentClient()
const secretsManager = new AWS.SecretsManager()

interface StripeSecret {
    api_key: string
}

export class StripeActions {
    private secretsManager = new AWS.SecretsManager()
    private secretCache: StripeSecret | undefined
    private stripe: Stripe | undefined

    constructor(private useCache: boolean = false) {}

    async getSecret(secretName: string): Promise<StripeSecret> {
        if (this.useCache && this.secretCache) return this.secretCache
        const secretValue = await secretsManager
            .getSecretValue({
                SecretId: secretName,
            })
            .promise()
        if (secretValue.SecretString === undefined)
            throw new Error('Secret is not found.')
        console.log({ secretValue })
        this.secretCache = JSON.parse(secretValue.SecretString)
        return this.secretCache as StripeSecret
    }

    async getStripe(): Promise<Stripe> {
        if (this.stripe) return this.stripe
        const secret = await this.getSecret('Stripe')
        this.stripe = new Stripe(secret.api_key, {
            apiVersion: '2020-03-02',
            typescript: true,
        })
        return this.stripe
    }
}
