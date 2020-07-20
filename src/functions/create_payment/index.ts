import { Context } from 'aws-lambda'
import Stripe from 'stripe'
import { StripeActions } from '../../shared/StripeActions'
import { Users } from '../../shared/Users'
import { User, Payment } from '../../shared/types'

const createPayment = async (user: User, amount: number) => {
    // Stripe 決済
    const mStripe = new StripeActions(true)
    const stripe = await mStripe.getStripe()
    const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'JPY',
        payment_method_types: ['card'],
        payment_method: user.paymentMethod,
    })
    return paymentIntent
}

export const handler = async (
    event: Payment,
    context: Context
): Promise<Stripe.PaymentIntent> => {
    const users = new Users()
    console.info({ event })
    console.info({ context })
    const user = await users.get(event.userId)
    if (!user) throw new Error(`user not found.`)
    const result = createPayment(user, event.amount)
    return result
}
