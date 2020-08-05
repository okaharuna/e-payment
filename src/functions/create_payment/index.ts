import { Context } from 'aws-lambda'
import Stripe from 'stripe'
import { StripeActions } from '../../shared/StripeActions'
import { Users } from '../../shared/Users'
import { User, Payment } from '../../shared/types'
import * as dayjs from 'dayjs'

interface Params {
    user: User
    storeCode: string
    amount: number
}

const createPayment = async (user: User, amount: number) => {
    // Stripe 決済
    const mStripe = new StripeActions(true)
    const stripe = await mStripe.getStripe()
    const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'JPY',
        payment_method_types: ['card'],
        payment_method: user.stripePaymentMethod,
    })
    return paymentIntent
}

export const handler = async (
    event: Params,
    context: Context
): Promise<Stripe.PaymentIntent> => {
    console.info({ event })
    console.info({ context })
    const result = await createPayment(event.user, event.amount)
    const payment = {
        amount: event.amount,
        userId: event.user.userId,
        paymentId: `${event.storeCode}_${dayjs().format('YYYYMMDD')}_`,
    }
    return result
}
