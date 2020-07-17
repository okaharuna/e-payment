import { Context } from 'aws-lambda'
import Stripe from 'stripe'
import { StripeActions } from '../../shared/StripeActions'
import { Payment } from '../../shared/types'

const createPayment = async (amount: number) => {
    // Stripe 決済
    const mStripe = new StripeActions(true)
    const stripe = await mStripe.getStripe()
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
    const result = createPayment(event.amount)
    return result
}
