const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');

const { addUser, getUser, getUsersInRoom, removeUser } = require('./users.js');

const PORT = process.env.PORT || 5000;

const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on('connection', (socket) => {
    console.log('new connection');

    socket.on('join', ({ name, room }, callback) => {
        console.log(name, room);

        const { error, user } = addUser({ id: socket.id, name: name, room: room });

        // Error handle
        // const error = true;

        if (error) return callback(error);

        socket.emit('message', { user: 'admin', text: `${name}, welcome to the ${user.room}` });
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name}, has joined` })

        socket.join(user.room);

        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })

        callback();
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('message', { user: user.name, text: message })
        io.to(user.room).emit('roomData', { user: user.name, users: getUsersInRoom(user.room) })
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        console.log('disconnected')

        if (user) {
            io.to(user.room).emit('message', { user: 'admin', text: `${user.name} left` })
        }
    })
});

app.use(router);
app.use(cors());

server.listen(PORT, () => console.log('Server starter on port', PORT));
