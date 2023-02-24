//socket service

const config = require('../config/config');
const cache = require("../config/redisClient");
const { EVENTS, REDIS, GROUP_CHAT } = require('../config/constants');
const externalService = require('./external.service')
const { Server } = require("socket.io");
const ApiError = require('../utils/ApiError');

const jwt = require('jsonwebtoken');

/**
 * @About When a user connect to socket server, we check if he sent the session id,
 * if its the case we search for the session, if it exist we confirm connection without changing any thing,
 * else we create a new session for him and add the session by key user_id to sessions table.
 * but if he didn't send us the session id, we create a new one for him.
 * The connection to chat server can be either for one2one or group text chat, in case of group text chat, 
 * client access a room
 */

const clients = [];

module.exports = function(server) {

    let sendDmMessage;
    let sendGroupMessage;
    let sendNotification;

    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            transports: ['websocket', 'polling'],
            credentials: true
        },
        allowEIO3: true
    });



    // namespaces
    const nsp_messages = io.of("/messages");
    const nsp_participants = io.of("/participants");



    // checking validity of token
    io.use(function(socket, next) {
        if (!socket.handshake.headers.authorization && !socket.handshake.auth.token) return next(new Error('Authorization header is required'));
        const token = socket.handshake.headers.authorization ? socket.handshake.headers.authorization : socket.handshake.auth.token;
        jwt.verify(token, config.jwt.secret, function(err, user) {
            console.log(err);
            if (err) return next(new Error('Authentication error'));
            socket.user = user;
            socket.token = token;
            if (socket.handshake.headers.ssid)
                socket.sessionId = socket.handshake.headers.ssid;
            next();
        });

    })

    /**
     * on client connect
     */

    io.on(EVENTS.CONNECTION, async(socket) => {

        let { sub: userId, username, name, media } = socket.user;
        let sessionId = socket.handshake.headers.ssid ? socket.handshake.headers.ssid : null;


        let session = {};
        const socketId = socket.id;

        // if this is the first connection of client, he will provide a null session id
        if (!sessionId) {
            console.log('session not provided')
            const crypto = require("crypto");
            const randomId = () => crypto.randomBytes(8).toString("hex");
            sessionId = randomId();
            session = await cache.setWithTtl(sessionId, { userId, socketId, username, name, media }, 80000)
            await cache.hSet(REDIS.HASH.SESSIONS.NAME, `${REDIS.HASH.SESSIONS.KEYS.USER_}${userId}`, sessionId)
            console.log(`initialized session for user ${userId}: ${sessionId}`)

        } else {

            session = await cache.get(sessionId);
            if (session) {

                session = {...session, socketId };

                await cache.setWithTtl(sessionId, session)
            }
            if (!session) {
                const crypto = require("crypto");
                const randomId = () => crypto.randomBytes(8).toString("hex");
                sessionId = randomId();

                await cache.hSet(REDIS.HASH.SESSIONS.NAME, `${REDIS.HASH.SESSIONS.KEYS.USER_}${userId}`, sessionId)

                await cache.setWithTtl(sessionId, { userId, socketId, username, name, media }, 80000)
            }
        }

        const conversations = [];
        socket.emit(EVENTS.SESSION, { sessionId });

        // Notify user for the remaining messages where he was not connected
        socket.emit(EVENTS.REMAINING_MESSAGES, conversations);


        /**
         * saving socket
         */

        clients[socket.id] = socket;


        //////////
        socket.on('test', () => {

        })


        ///////////////////////////////// GROUP CHAT EVENTS ///////////////////////////////////
        /**
         *  handling the pre actions of joining
         *  */
        socket.on(EVENTS.ROOM.JOIN, async(data) => {
            const { chatRoomId, roomId, chatRoomConfig, chatRoomInvites } = data;
            const currentUser = socket.user;

            // check the room type (for only moderators or for members)
            const isGranted = await externalService.grantAccessToChatRoom(chatRoomId, roomId, currentUser.sub, socket.token);
            console.log(isGranted);

            if (!isGranted) {
                throw new Error('You are not authorized to access this room');

            }
            const actives = await io.in(chatRoomId);
            const activeSockets = actives.allSockets();
            const entries = actives.sockets.adapter.nsp.sockets.values();
            const activeParticipants = [];

            for (let p of entries) {
                if (p.user.username != currentUser.username) {
                    activeParticipants.push({
                        username: p.user.username,
                        media: p.user.media,
                        name: p.user.name,

                    });

                }
            }
            const numberOfParticipants = activeSockets.size;
            // restrict on number of participants
            if (numberOfParticipants == config.groupChat.maxParticipants) {
                // CHECK AND GO TO NEXT SERVER
                socket.disconnect();
            } else {
                // number of clients connected
                socket.join(chatRoomId) // Join the room
                console.log(`${username} joined the room`)
                socket.broadcast.to(chatRoomId).emit(EVENTS.ROOM.USER_JOINED, { username, active_users: { count: numberOfParticipants, users: [...activeParticipants] } }) // Tell everyone else in the room that we joined
            }

            // Communicate the disconnection

        })

        /**
         *  handling the messaging here
         *  */
        socket.on(EVENTS.ROOM.MESSAGES.SEND_GROUP_MESSAGE, async(daa) => {

        })

        /////////////////////////// CONFERENCE //////////////////////////////////////////////////
        socket.emit('connection-success', {
            socketId: socket.id,
        })

        const removeItems = (items, socketId, type) => {
            items.forEach(item => {
                if (item.socketId === socket.id) {
                    item[type].close()
                }
            })
            items = items.filter(item => item.socketId !== socket.id)

            return items
        }

        /**
         * @About on client disconnect, we need to remove all components related to the instance
         * including CONSUMER,PRODUCER and TRANSPORT
         */
        socket.on(EVENTS.DISCONNECT, () => {
            // remove socket from clients var
            console.log(`${socket} is disconnected`)
            clients.slice(clients.indexOf(socket.id));
            console.log(`client variable cleaned successfully`)

        })
    })

    // methods called in controller
    sendDmMessage = async(message) => {
            console.log('sending DM message socket...')
            console.log(message);

            // on new message create conversation for the actors
            const { to, data, conversationId, from, timestamps } = message;
            console.log(`${from} want to send message to ${to}`)
                // NEED TO CHECK IF RECEIVER DID NOT BLOCK THE SENDER



            // testing just 1 user
            const senderUserId = from;
            const receiverUserId = to;

            try {
                const [sessionReceiver] = await cache.hmget(REDIS.HASH.SESSIONS.NAME, `${REDIS.HASH.SESSIONS.KEYS.USER_}${receiverUserId}`);
                const [sessionSender] = await cache.hmget(REDIS.HASH.SESSIONS.NAME, `${REDIS.HASH.SESSIONS.KEYS.USER_}${senderUserId}`);

                if (!sessionReceiver) throw new Error('receiver did never connect')
                if (!sessionSender) throw new Error('sender did never connect')

                const infosSender = await cache.get(sessionSender);
                const infosReceiver = await cache.get(sessionReceiver);
                if (infosReceiver) {
                    const message = { conversationId, data, timestamps, from: infosSender };
                    ///////////////
                    clients[infosReceiver.socketId].emit(EVENTS.MESSAGES.RECEIVE_MESSAGE, message);
                    console.log('message sent successfully');
                }
                return {};
            } catch (err) {
                console.log(err);

            }
        }
        /**
         * 
         */
    sendGroupMessage = async(message) => {


            try {
                const {
                    chatRoomId,
                    data,
                    from,
                    timestamps
                } = message;


                const [sessionSender] = await cache.hmget(REDIS.HASH.SESSIONS.NAME, `${REDIS.HASH.SESSIONS.KEYS.USER_}${from.userId}`);

                if (!sessionSender) throw new Error('Please connect the sender to socket server first')

                const infosSender = await cache.get(sessionSender);
                if (infosSender) {
                    console.log(`broadcasting from ${infosSender.socketId} to room ${chatRoomId}`)
                        ///////////////
                    console.log(EVENTS.ROOM.MESSAGES.RECEIVE_GROUP_MESSAGE, message);
                    clients[infosSender.socketId]
                        .broadcast
                        .to(chatRoomId)
                        .emit(EVENTS.ROOM.MESSAGES.RECEIVE_GROUP_MESSAGE, message);


                }
                // we broadcast the message to the whole users in the room

            } catch (e) {
                console.log(e);
                throw new ApiError('An error occured when sending group message')
            }

        }
        /**
         *
         */

    sendNotification = async(notificationBody) => {
        try {

            console.log(notificationBody);
            const { message, usersIds } = notificationBody
            const userId = usersIds[0];
            const [session] = await cache.hmget(REDIS.HASH.SESSIONS.NAME, `${REDIS.HASH.SESSIONS.KEYS.USER_}${userId}`);

            console.log(session);
            if (session) { // if session exist will send socket notif
                const infos = await cache.get(session);
                if (infos) {
                    console.log('sending notification to:', infos.socketId);
                    console.log(message);
                    clients[infos.socketId].emit(EVENTS.NOTIFICATIONS.NEW_NOTIFICATION, message)
                    console.log('notification sent to :', infos.socketId)

                }
            }



            return notificationBody;
        } catch (err) {
            console.log(err);
            throw new Error('an error occured')
        }
    }

    return ({ sendDmMessage, sendGroupMessage, sendNotification })

}