import { sendCommand, getLampCommand } from '../src/ilooksLamp'

async function main() {
  const LAMP_IP = '192.168.0.100'
  const LAMP_PORT = 10000

  const result = await sendCommand(LAMP_IP, LAMP_PORT, getLampCommand({
    redLamp: 'OFF',
    sound: 'OFF',
  }))

  console.log(result)
}

main()
