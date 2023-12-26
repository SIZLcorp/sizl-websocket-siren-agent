const io = require('socket.io-client')
const socket = io('http://localhost:3000')

socket.on('joined', function (data) {
  console.log('receive hello:', data)
})


socket.emit('call', 'socket.join', { room: 'joined' }, function (err, res) {
  if (err) {
    console.error(err)
  } else {
    console.log('call success:', res)
  }
})

socket.emit('call', 'socket.list', function (err, res) {
  if (err) {
    console.error(err)
  } else {
    console.log('call success:', res)
  }
})

