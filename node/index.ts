import {
  LRUCache,
  Service,
  ServiceContext,
  ParamsContext,
  RecorderState,
  method,
} from '@vtex/api'
import { Clients } from './clients'
import { analytics } from './handlers/analytics'
import { updateLiveUsers } from './events/liveUsersUpdate'
import { createSendEvent } from './routes/notify'
import { getCacheContext, setCacheContext } from './utils/cachedContext'

// Create a LRU memory cache for the Status client.
// The @vtex/api HttpClient respects Cache-Control headers and uses the provided cache.
const memoryCache = new LRUCache<string, any>({ max: 5000 })
metrics.trackCache('status', memoryCache)

const TREE_SECONDS_MS = 3 * 1000
const CONCURRENCY = 10

declare global {
  type Context = ServiceContext<Clients, State>

  interface State extends RecorderState {
    code: number
  }
}

function sendEventWithTimer() {
  setInterval(function () {
    const context = getCacheContext()

    if (!context) {
      console.log('no context in memory')

      return
    }

    return createSendEvent(context)
  }, 30000)
  console.log('FIRED HERE')
}

sendEventWithTimer()

export default new Service<Clients, State, ParamsContext>({
  clients: {
    implementation: Clients,
    options: {
      default: {
        retries: 2,
        timeout: 10000,
      },
      events: {
        exponentialTimeoutCoefficient: 2,
        exponentialBackoffCoefficient: 2,
        initialBackoffDelay: 50,
        retries: 5,
        timeout: TREE_SECONDS_MS,
        concurrency: CONCURRENCY,
      },
    },
  },
  routes: {
    analytics: method({
      GET: [analytics],
    }),
    hcheck: (ctx: any) => {
      setCacheContext(ctx)
      ctx.set('Cache-Control', 'no-cache')
      ctx.status = 200
      ctx.body = 'ok'
    },
  },
  events: {
    liveUsersUpdate: updateLiveUsers,
  },
})