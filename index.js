require('dotenv').config()

const express = require('express')
const chats = require('./data/data')
const connectToDb = require('./config/db')
const userRoutes = require('./routes/userRoutes')
const chatRoutes = require('./routes/chatRoutes')
const messageRoutes = require('./routes/messageRoutes')
const {createServer} = require('http')
const {Server} = require('socket.io')
const cors = require('cors')

const app = express()


app.use(cors({
    origin: 'https://chatty-ui.onrender.com/',
    credentials: true
}))


const port = process.env.PORT || 3000

app.use(express.json())


const server = createServer(app)

const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: 'https://chatty-ui.onrender.com'
    }
})


io.on("connection",(socket) => {

    socket.on("setup", (userData) => {
        socket.join(userData?._id)
        socket.emit("connected")
    })
    
    socket.on('join chat',(room) =>{
        socket.join(room)

    })

    socket.on("new message",(newMessageRecieved)=>{
        let chat = newMessageRecieved?.chat

        // console.log('the new message is ', newMessageRecieved)


        if(!chat.users) return console.log('chat.users not defined')

        chat.users.forEach(user => {
            if(user?._id === newMessageRecieved?.sender?._id) return;

            socket.in(user?._id).emit("message recieved",newMessageRecieved)
        })

    })

})

app.get('/', (req, res) => {
    res.send('API is running')
})

app.use('/api/user', userRoutes)
app.use('/api/chat', chatRoutes)

app.use('/api/message', messageRoutes)


app.use((err, req, res, next) => {
    res.status(400).send({ error: err.message })
})

server.listen(port, () => {
    console.log('app listening on port', port);
})


connectToDb()
    .then(() => {
        console.log('connected to mongodb')
    })
    .catch((err) => {
        console.error(err)
    })


