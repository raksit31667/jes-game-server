const _ = require('lodash')
const { expect } = require('chai')

const io = require('socket.io-client')
const PORT = process.env.PORT || 5000
const SOCKET_URL = `http://localhost:${PORT}`

const app = require('../app')
const GameManager = require('../managers/game')
const gameEvents = require('../constants/events')

let options = {
    transports: ['websocket'],
    forceNew: true,
    reconnection: false
};

describe('Room Manager', () => {

    describe('Player join game', () => {
        afterEach(() => {
            GameManager.instance = null
        })

        it('should add player to the list', (done) => {
            let client = io.connect(SOCKET_URL, options)
            client.on('connect', (data) => {
                client.emit(gameEvents.playerJoinGame, { username: '1234' })
            })

            client.on(gameEvents.playerJoinGame, (data) => {
                let player = GameManager.getPlayer(data.d[0])
                expect(player).to.not.be.undefined
                client.disconnect()
                done()
            })
        })

        it('should add player with client username', (done) => {
            let client = io.connect(SOCKET_URL, options)
            client.on('connect', (data) => {
                client.emit(gameEvents.playerJoinGame, { username: '1234' })
            })

            client.on(gameEvents.playerJoinGame, (data) => {
                let player = GameManager.getPlayer(data.d[0])
                expect(player.username).to.equal('1234')
                client.disconnect()
                done()
            })
        })
    })

    describe('Player join room', () => {
        afterEach(() => {
            GameManager.instance = null
        })

        it('should add player to room', (done) => {
            let client, playerID
            client = io.connect(SOCKET_URL, options)
            client.on('connect', (data) => {
                client.emit(gameEvents.playerJoinGame, { username: '1234' })
            })

            client.on(gameEvents.playerJoinGame, (data) => {
                playerID = data.d[0]
                client.emit(gameEvents.playerJoinRoom, { d: `[@${playerID}@,0]` })
            })

            client.on(gameEvents.playerJoinRoom, (data) => {
                expect(GameManager.getRoom('0')).to.not.be.undefined
                client.disconnect()
                done()
            })
        })

        it('should not add player if room is full', (done) => {
            let client = io.connect(SOCKET_URL, options)
            client.on('connect', (data) => {
                client.emit(gameEvents.playerJoinGame, { username: '1234' })
            })

            client.on(gameEvents.playerJoinGame, (data) => {
                let playerID = data.d[0]
                client.emit(gameEvents.playerJoinRoom, { d: `[@${playerID}@,0]` })
            })

            client.on(gameEvents.playerJoinRoom, (data) => {
                let anotherClient = io.connect(SOCKET_URL, options)
                anotherClient.on('connect', (data) => {
                    anotherClient.emit(gameEvents.playerJoinGame, { username: '5678' })
                })

                anotherClient.on(gameEvents.playerJoinGame, (data) => {
                    let anotherPlayerID = data.d[0]
                    anotherClient.emit(gameEvents.playerJoinRoom, { d: `[@${anotherPlayerID}@,0]` })
                })

                anotherClient.on(gameEvents.playerJoinRoom, (data) => {
                    let playersInRoom = GameManager.getRoom('0').getPlayers()
                    expect(playersInRoom.length).to.equal(1)
                    client.disconnect()
                    anotherClient.disconnect()
                    done()
                })
            })
        })
    })
})

