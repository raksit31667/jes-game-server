
const express = require('express')
const app = express()
const server = require('http').Server(app)
const _ = require('lodash')
const shortid = require('shortid')
const path = require('path')

const io = require('socket.io')(server)

const GameManager = require('./managers/game')
const gameEvents = require('./constants/events')
const RoomManager = require('./managers/room')

const APP_CONFIG = require('./config.json')

let gameInterval = null

// let gameManager = new GameManager(io, gameWorld)

console.log('GAME-SERVER VERSION :: ', APP_CONFIG.GAME_VERSION)

io.on('connection', (socket) => {
    let roomManager = new RoomManager(socket);
    roomManager.createNewRoom();
    socket.playerID = shortid.generate()
    console.log('Player', socket.playerID, socket.id, 'connected')
    // let weaponsInMap = gameWorld.getUpdateWeaponInMap()
    // console.log('send-weapon-data',weaponsInMap)
    // socket.emit(gameEvents.setupEquitment,{d:weaponsInMap})

    socket.on('disconnect', () => {
        let pid = socket.playerID
        let data = { "d": pid }
        io.emit(gameEvents.playerDisconnect, data)
        console.log('remove player', socket.playerID)
        roomManager.deletePlayer()
    })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
    console.log(`Listen on http://localhost:${PORT}`)
    // gameInterval = gameManager.createGameInterval()
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
})