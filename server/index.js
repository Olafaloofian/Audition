const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const bodyParser = require('body-parser')

app.use(bodyParser.json())

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
        console.log('CONNECTIONS ONLINE', onlineUsers)
        const usersInRoom = onlineUsers.filter(user => { 
            return user.room === room
        })
        io.in(room).emit('roomUsers', usersInRoom)
    })

    socket.on('message', data => {
        socket.broadcast.emit('message', data)
        // let requestedUser = onlineUsers.find(user => user.openConnection.userid === data.to)
        // console.log('oooooooo => requestedUser', requestedUser)
        // requestedUser && io.in(requestedUser.room).emit('message', data)
    })

    socket.on('updateConnection', data => {
        console.log('UPDATE CONNECTION', data)


        let currentUser = onlineUsers.find(user => user.socketId === data.socketId)
        let newConnection = onlineUsers.find(user => user.openConnection == data.participantid)
        
        // let newConnectionIndex = onlineUsers.findIndex(user => user.socketid === data.participantid)

        if(currentUser) {
            // const currentUser = onlineUsers[currentUserIndex]
            // const newConnection = onlineUsers[newConnectionIndex]
            // const connectionData = {
            //     username: newConnection.username, 
            //     room: newConnection.room, 
            //     openConnection: newConnection.openConnection, 
            //     socketId: newConnection.socketId
            // }
            // onlineUsers[currentUserIndex].connections.push(connectionData)
            currentUser.connections.push({id: currentUser.openConnection, participantid: data.participantid})
            if(newConnection.connections.find(newConnection => currentUser.connections.map(connection => +connection.id).includes(+newConnection.participantid))) {
                currentUser.openConnection = data.openConnection
                newConnection.openConnection = newConnection.pendingConnection
                newConnection.pendingConnection = null
            } else {
                currentUser.pendingConnection = data.openConnection
            }
            console.log('UPDATE ONLINE', onlineUsers)
        } else {
            console.log('~~USERS NOT FOUND~~')
        }
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

app.get('/api/users-in-room', (req, res) => {
    const { room } = req.query
    const usersInRoom = onlineUsers.filter(user => user.room === room)
    console.log('------REQUEST USERS')
    res.status(200).send(usersInRoom)
})

app.get('/api/stream', (req, res) => {
    const { participantid } = req.query
    const selectedUser = onlineUsers.find(user => user.openConnection == participantid)
    console.log('------------ selectedUser', selectedUser, participantid)
    if(selectedUser) {
        res.status(200).send(selectedUser)
    } else {
        res.status(404).send('No user found!')
    }
})

const path = require("path");
// app.get("*", (req, res) => {
// 	res.sendFile(path.join(__dirname, "../build/index.html"));
// });

server.listen(port, () => {
    console.info(`Server is listening on port ${port} 🌆`)
})

