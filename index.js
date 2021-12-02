/*
*   Starting the server
* */
const io = require("socket.io")(8080, {
    cors: {
        origin: "http://localhost:3001",
    },
});

/*
*   Store userId and socketId
*   use for online friends list
* */
let users = []

/*
*   Helper functions
* */
const addUser = (userId, socketId) => {
    !users.some(user => user.userId === userId) && users.push({userId, socketId})
}

const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId)
}

const getUser = (userId) => {
    return users.find(user => user.userId === userId)
}

/*
*   Initializing the socket io connection
* */
io.on('connection', (socket) => {
    /*
    *   When a user go online
    * */
    socket.on('addUser', (userId) => {
        console.log("a user connected")
        addUser(userId, socket.id)
        // sending online friends list
        io.emit('getUsers', users)
    })

    /*
    *   When a user go offline
    * */
    socket.on('disconnect', () => {
        console.log("a user disconnected")
        removeUser(socket.id)
        // sending new online friends list
        io.emit('getUsers', users)
    })

    /*
    *   Send message
    * */
    socket.on('sendMsg', ({senderId, receiverId, text}) => {
        const user = getUser(receiverId)
        io.to(user.socketId).emit('getMsg', {
            senderId,
            text,
        })
    })
})