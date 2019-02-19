const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
// const bodyParser = require('body-parser')

// app.use(bodyParser.json())

const port = 4020

app.use(express.static(`${__dirname}/../build`));

io.sockets.on('connection', socket => {
    let room
    let currentUsers = []
    let currentStreams = []
    let onlineCount = 0

    socket.on('join', userData => {
        onlineCount++
        console.log('------------ user', userData)
        socket.join(userData.room)
        if(!currentStreams.find(stream => stream.userid === data.userid)) {
            currentStreams.push(userData)
        }
        console.log('CURRENT STREAMS', currentStreams)
        socket.emit('currentStreams', currentStreams)
        console.log('Client joined!')
    })

    socket.on('message', data => {
        console.log('------------ data', socket.id)
        // if(!currentStreams.find(stream => stream.userid === data.userid)) {
        //     currentStreams.push(data)
        // }
        // console.log('CURRENT STREAMS', currentStreams)
        socket.emit('currentStreams', currentStreams)
        io.sockets.to(data.recipient).emit('message', data.message)
    })

    socket.on('userPresence', data => {
        socket.broadcast.emit('currentUsers', currentUsers)
    })

    socket.on('disconnect', user => {
        let userIndex = currentUsers.findIndex(userObject => userObject === user)
        currentUsers.splice(userIndex, 1)
        socket.broadcast.emit('currentUsers', currentUsers)
    })
})

const path = require("path");
// app.get("*", (req, res) => {
// 	res.sendFile(path.join(__dirname, "../build/index.html"));
// });
 
server.listen(port, () => {
    console.info(`Server is listening on port ${port} 🌆`)
})

