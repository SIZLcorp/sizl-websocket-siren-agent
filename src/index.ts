import WebSocket from 'ws'
import Debug from 'debug'
const debug = Debug('sizl-siren')

const connectionDebug = debug.extend('connection')
const receiveDebug = debug.extend('receive')

const WEBSOCKET_URL = process.env.WEBSOCKET_URL || 'wss://fw1j7695z7.execute-api.ap-northeast-2.amazonaws.com/dev'

const TIME_INTERVAL = 5000
const PING_TIMEOUT_INTERVAL = 31000
const PING_INTERVAL = 30000
const MFR_CODE = process.env.MFR_CODE || 'customCode'

let openedSocketFlag = false
let pingInterval: NodeJS.Timer
let pongTimeout: NodeJS.Timeout


function connect(): Promise<boolean> {
  const client = new WebSocket(WEBSOCKET_URL, {
    headers: {
      mfrCode: MFR_CODE,
    },
  })

  function heartbeat() {
    connectionDebug(MFR_CODE + ': pong received.')
    clearTimeout(pongTimeout)

    // Use `WebSocket#terminate()`, which immediately destroys the connection,
    // instead of `WebSocket#close()`, which waits for the close timer.
    // Delay should be equal to the interval at which your server
    // sends out pings plus a conservative assumption of the latency.
    pongTimeout = setTimeout(() => {
      connectionDebug(MFR_CODE + ': Terminating connection: no pong received.')
      client.terminate()
    }, PING_TIMEOUT_INTERVAL)
  }

  return new Promise((resolve, reject) => {
    connectionDebug(MFR_CODE + ': client try to connect...')

    client.on('error', (err) => {
      connectionDebug(MFR_CODE + ': WEBSOCKET_ERROR: Error', new Error(err.message))
      openedSocketFlag = false
      reject(err)
    })

    client.on('close', function clear(err) {
      connectionDebug(MFR_CODE + ': connection closed.')
      clearTimeout(pongTimeout)
      clearInterval(pingInterval)

      openedSocketFlag = false
      reject(err)
    })

    client.on('pong', heartbeat)

    client.on('open', function open() {
      openedSocketFlag = true
      connectionDebug(MFR_CODE + ': initial ping sent.')
      client.ping()
      pingInterval = setInterval(() => {
        console.log(MFR_CODE + ': ping sent.')
        client.ping()
      }, PING_INTERVAL)
      resolve(openedSocketFlag)
    })

    client.on('message', function message(data) {
      receiveDebug(MFR_CODE + ': received: %s', data)
      // TODO: do something with data
    })
  })
}


async function reconnect() {
  try {
    await connect()
  } catch (err) {
    connectionDebug('WEBSOCKET_RECONNECT: Error', err)
  }
}

connect()

// repeat every timeInterval
setInterval(() => {
  if (!openedSocketFlag) {
    reconnect()
  }
}, TIME_INTERVAL)