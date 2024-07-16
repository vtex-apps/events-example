import { Clients } from '../clients/index'
import { EventContext } from '@vtex/api'

export async function updateLiveUsers(ctx: EventContext<Clients>) {
    console.info(`GOT HERE 2`)
    const liveUsersProducts = await ctx.clients.analytics.getLiveUsers()
    console.log('LIVE USERS: ', liveUsersProducts)
    return true
}