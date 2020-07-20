import { Context } from 'aws-lambda'
import { Users } from '../../shared/Users'
import { User, PaymentMethod } from '../../shared/types'
const users = new Users()

interface Params {
    userId: string
    amount: number
}

interface Response {
    userId: string
    amount: number
    paymentMethod: PaymentMethod
}

const check = async (user: User): Promise<any> => {
    if (user.stripePaymentMethod)
}

export const handler = async (
    event: Params,
    context: Context
): Promise<Response> => {
    console.info({ event })
    console.info({ context })
    const user = await users.get(event.userId)
    if (!user) throw new Error('Unregistered user.')

    const paymentMethod: PaymentMethod = user.stripePaymentMethod ? 'stripe' : 'post-pay'
    const result: Response = {
        amount: event.amount,
        userId: event.userId,
        paymentMethod
    }
    return result
}
