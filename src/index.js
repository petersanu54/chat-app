const path = require('path')
const express = require('express')
const http = require('http')
const app = express()
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage} = require('./utils/messages.js')
const {generateLocationMessage} = require('./utils/messages.js')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/user.js')


const server = http.createServer(app)
const io = socketio(server)
const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

// let count = 0
// io.on('connection', (socket)=>{
//     //here socket is an obejct and it contains the info abour new connections. So if client connects to server this whole function will run 5 times
//     //when anything needs to be listened on the server should fall in this function
//     console.log('New websocket connection')
//     socket.emit('countUpdated', count)
//     //socket.emit will send data back to the newly connected client. Not using io.emit as whenever any new client join then server will send the count to every client and that is a waste
//     socket.on('increment', ()=>{ //listen from client
//         count ++
//         //count is updated and need to be send back to client using socket.emit
        
//     //socket.emit('countUpdated', count)
//         //but here is a problem that when we are using socket.emit we are emiting the output to a particular client but i need to emiit to all the clients hence commenting this
//         //we will use io.emit which will emit every single connection
//         io.emit('countUpdated', count)
//     })
// })

io.on('connection',(socket)=>{
    console.log('new socket connection')
    // socket.emit('message', generateMessage('Welcome'))
    //socket.emit sends message ehen a new client joins

    //now i want to send message to all the clients that a new client has joined except the new client
    //that can be done usin broadcast
    // socket.broadcast.emit('message', generateMessage('A new user has joined'))// this will send message to everyone except the socket that the current joinee

    socket.on('join', ({username, room}, callback)=>{
        const {error,user} = addUser({id:socket.id, username, room})
        //the above can be done as below way also by using rest operator i.e spread operator
        
        // socket.on('join', (options, callback)=>{
        //     const {error,user} = addUser({id:socket.id, ...options}) 
        
        if(error){
            return callback(error)
        }
        socket.join(user.room)//socket.join method allows us to join a given chatroom
        
        //socket.emit, io.emit, socket.broadcast.emit
        //now here we have a new emit - io.to.emit - this emits to everybody in a specific room
        //socket.broadcast.to.emit - this emits to everybody in a specific room except the socket (current client)
        socket.emit('message', generateMessage('Admin','Welcome'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined! `))
        io.to(user.room).emit('roomData',{
            room : user.room,
            users : getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage',(message, callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })


    //in case somone left we need to send the message to everyone so fro this
    //we will use diconnect just like connect as these are socket in built libraries
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        //if user was part of the room then only we shold display user had left    
        if(user){
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users : getUsersInRoom(user.room)
            })
        }

    })

    socket.on('sendLocation', (coords, callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })
})


server.listen(port, ()=>{
    console.log('Port is up and running on ', port)
})

app.use(express.static(publicDirectoryPath))
//to serve up publicDirectoryPath







console.log(__dirname)