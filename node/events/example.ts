import type { EventContext } from '@vtex/api'
import { Clients } from '../clients'

export async function example(ctx: EventContext<Clients>) {
  console.log('RECEIVED EVENT', ctx.body)

  return true
}
