import 'dotenv/config'

import WebSocket from 'ws'
import Debug from 'debug'
import { getLampCommand, sendCommand } from './ilooksLamp'
import { exec as execCallback } from "child_process"
import { promisify } from 'util'

const exec = promisify(execCallback);

const debug = Debug('sizl-siren')

const connectionDebug = debug.extend('connection')
const receiveDebug = debug.extend('receive')
const WEBSOCKET_URL = process.env.WEBSOCKET_URL || 'wss://orxxw2muga.execute-api.ap-northeast-2.amazonaws.com/dev'

const TIME_INTERVAL = 5000
const PING_TIMEOUT_INTERVAL = 31000
const PING_INTERVAL = 30000
const MFR_CODE = process.env.MFR_CODE || 'customCode'
const COMPANY_CODE = process.env.COMPANY_CODE || 'customCompany'
const LAMP_IP = process.env.LAMP_IP || '192.168.0.100'
const LAMP_PORT = parseInt(process.env.LAMP_PORT || '0000') || 10000
const LABEL_TEMPLATE_PATH = process.env.LABEL_TEMPLATE_PATH  || 'C:\\Users\\sizl\\Documents\\label_template.btw'
const BARTENDER_PATH = process.env.BARTENDER_PATH || 'C:\\Program Files\\Seagull\\BarTender 2022\\BarTend.exe'
const LABEL_SOURCE_PATH = process.env.LABEL_SOURCE_PATH || 'C:\\Users\\sizl\\Documents\\barcode_source.csv'

let openedSocketFlag = false
let pingInterval: NodeJS.Timer
let pongTimeout: NodeJS.Timeout


function connect(): Promise<boolean> {
  const client = new WebSocket(WEBSOCKET_URL, {
    headers: {
      mfrCode: MFR_CODE,
      companyCode: COMPANY_CODE,
    },
  })

  function heartbeat() {
    connectionDebug(COMPANY_CODE + '>' + MFR_CODE + ': pong received.')
    clearTimeout(pongTimeout)

    // Use `WebSocket#terminate()`, which immediately destroys the connection,
    // instead of `WebSocket#close()`, which waits for the close timer.
    // Delay should be equal to the interval at which your server
    // sends out pings plus a conservative assumption of the latency.
    pongTimeout = setTimeout(() => {
      connectionDebug(COMPANY_CODE + '>' + MFR_CODE + ': Terminating connection: no pong received.')
      client.terminate()
    }, PING_TIMEOUT_INTERVAL)
  }

  return new Promise((resolve, reject) => {
    connectionDebug(COMPANY_CODE + '>' + MFR_CODE + ': client try to connect...')

    client.on('error', (err) => {
      connectionDebug(COMPANY_CODE + '>' + MFR_CODE + ': WEBSOCKET_ERROR: Error', new Error(err.message))
      openedSocketFlag = false
      reject(err)
    })

    client.on('close', function clear(err) {
      connectionDebug(COMPANY_CODE + '>' + MFR_CODE + ': connection closed.')
      clearTimeout(pongTimeout)
      clearInterval(pingInterval)

      openedSocketFlag = false
      reject(err)
    })

    client.on('pong', heartbeat)

    client.on('open', function open() {
      openedSocketFlag = true
      connectionDebug(COMPANY_CODE + '>' + MFR_CODE + ': initial ping sent.')
      client.ping()
      pingInterval = setInterval(() => {
        console.log(COMPANY_CODE + '>' + MFR_CODE + ': ping sent.')
        client.ping()
      }, PING_INTERVAL)
      resolve(openedSocketFlag)
    })

    // csv -> s3 경로 주면,
    // csv 를 다운로드 받고,
    // 다운로드 받은 경로를 LABEL_SOURCE_PATH 대신에 주면 된다!

    client.on('message', async function message(data) {
      receiveDebug(COMPANY_CODE + '>' + MFR_CODE + ': received: %s', data)
      // C:\Program` Files\Seagull\BarTender` 2022\BarTend.exe  C:\Users\sizl\Documents\label_template.btw /D=C:\Users\sizl\Documents\barcode_source.csv /P /X
      const printCommand = `"${BARTENDER_PATH}" ${LABEL_TEMPLATE_PATH} /D=${LABEL_SOURCE_PATH} /P /X`
      // const printCommand = `echo "${BARTENDER_PATH}" ${LABEL_TEMPLATE_PATH} /D=${LABEL_SOURCE_PATH} /P /X`
      console.log(printCommand)
     const execResult =  await exec(printCommand, {
      encoding: 'utf8'
     })
     console.log(execResult)
      // await sendCommand(LAMP_IP, LAMP_PORT, getLampCommand({
      //   redLamp: 'BLINK',
      //   sound: '1',
      // }))

      // setTimeout(async () => {
      //   await sendCommand(LAMP_IP, LAMP_PORT, getLampCommand({
      //     redLamp: 'OFF',
      //     sound: 'OFF',
      //   }))
      // }, 2000)
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

setInterval(() => {
  if (!openedSocketFlag) {
    reconnect()
  }
}, TIME_INTERVAL)