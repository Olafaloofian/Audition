const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
// const bodyParser = require('body-parser')

// app.use(bodyParser.json())

const port = 4020

app.use(express.static(`${__dirname}/../build`));

let onlineUsers = []
let pendingRequests = []
let pendingOffers = []

io.sockets.on('connection', socket => {
    let room
    let connections = {}
    let currentUsersInRoom = []
    let onlineCount = 0

    socket.on('join', userData => {
        const room = userData.room
        onlineCount++
        socket.join(room)
        if(!onlineUsers.find(user => user === userData)) {
            onlineUsers.push(userData)
        }
        console.log('CURRENT STREAMS', onlineUsers)
        const usersInRoom = onlineUsers.filter(user => { 
            return user.room === room
        })
        io.in(room).emit('roomUsers', usersInRoom)
    })

    socket.on('message', data => {
        // socket.broadcast.emit('message', data)
        console.log('MESSAGE FROM PEERCONNECTION', data)
        let currentUser = onlineUsers.find(user => user.socketid === socket.id)
        currentUser && io.in(currentUser.room).emit('message', data)
    })

    socket.on('userPresence', data => {
        socket.broadcast.emit('currentUsers', currentUsers)
    })

    socket.on('disconnect', user => {
        let userIndex = onlineUsers.findIndex(userObject => userObject === user)
        onlineUsers.splice(userIndex, 1)
        socket.broadcast.emit('onlineUsers', onlineUsers)
    })
})

const path = require("path");
// app.get("*", (req, res) => {
// 	res.sendFile(path.join(__dirname, "../build/index.html"));
// });

server.listen(port, () => {
    console.info(`Server is listening on port ${port} 🌆`)
})

