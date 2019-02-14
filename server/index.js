const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
// const bodyParser = require('body-parser')

// app.use(bodyParser.json())

const port = 4020

app.use(express.static(`${__dirname}/../build`));

io.sockets.on('connection', socket => {
    socket.on('join', join => {
        console.log('Client joined!')
    })

    socket.on('microphone', audio => {
        socket.broadcast.emit('audio', audio)
    })
})

const path = require("path");
// app.get("*", (req, res) => {
// 	res.sendFile(path.join(__dirname, "../build/index.html"));
// }); 

server.listen(port, () => {
    console.info(`Server is listening on port ${port} 🌆`)
})

