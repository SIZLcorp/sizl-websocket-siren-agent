import net from 'net'

export function sendCommand(host: string, port: number, command: string | Buffer): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const client = net.createConnection({ host, port }, () => {
      client.write(command)
    })

    client.on('data', (data) => {
      resolve(data.toString())
      client.end()
    })

    client.on('error', (err) => {
      reject(err)
    })
  })
    .then((result: any) => {
      if (result === 'ACK') return true
      else return false
    })
}

export function getLampCommand(params: {
  redLamp: 'ON' | 'OFF' | 'BLINK',
  sound: '1' | '2' | '3' | '4' | 'OFF'
}): Buffer {
  const RED_BLINK = 0x80
  const RED_ON = 0x04
  const RED_OFF = 0x00

  const SOUND_1 = 0x01
  const SOUND_2 = 0x02
  const SOUND_3 = 0x03
  const SOUND_4 = 0x04
  const SOUND_OFF = 0x00

  const WriteFlag = 0x57

  const { redLamp, sound } = params

  let byte1 = RED_OFF

  switch (redLamp) {
    case 'ON':
      byte1 = RED_ON
      break
    case 'OFF':
      byte1 = RED_OFF
      break
    case 'BLINK':
      byte1 = RED_BLINK
      break
    default:
      byte1 = RED_OFF
      break
  }

  let byte2 = SOUND_OFF

  switch (sound) {
    case '1':
      byte2 = SOUND_1
      break
    case '2':
      byte2 = SOUND_2
      break
    case '3':
      byte2 = SOUND_3
      break
    case '4':
      byte2 = SOUND_4
      break
    case 'OFF':
      byte2 = SOUND_OFF
      break
    default:
      byte2 = SOUND_OFF
      break
  }

  return Buffer.from([WriteFlag, byte1, byte2])
}