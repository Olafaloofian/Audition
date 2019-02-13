const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const port = 3000

app.use(express.static(`${__dirname}/../build`));

io.sockets.on('connection', socket => {
    socket.on('join', join => {
        console.log('Client joined!')
    })
})

const path = require("path");
app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "../build/index.html"));
}); 

app.listen(port, () => {
    console.info(`Server is listening on port ${port} 🌆`)
})

