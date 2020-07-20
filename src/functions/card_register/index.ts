import { Context } from 'aws-lambda'
import { User } from '../../shared/types'
import { StripeActions } from '../../shared/StripeActions'
import { Users } from '../../shared/Users'
const users = new Users()
const stripeAction = new StripeActions(true)

interface Event {
    userId: string
    paymentMethod: string
}

const cardRegister = async (user: User, paymentMethod: string) => {
    if (user.stripeCustomerId) {
        return await stripeAction.registerCard(
            user.stripeCustomerId,
            paymentMethod
        )
    } else {
        return await stripeAction.createCustomer(paymentMethod, user.email)
    }
}

export const handler = async (
    event: Event,
    context: Context
): Promise<User> => {
    console.info({ event })
    console.info({ context })
    const user = await users.get(event.userId)
    if (!user) throw new Error(`No user data found`)
    const result = await cardRegister(user, event.paymentMethod)
    result.id
    const updated = await users.updateCard(event.userId, event.paymentMethod)
    return updated
}
