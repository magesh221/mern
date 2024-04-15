const express = require("express");
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const helper = require('../helpers/common');
const db = require('../models/index');

const client = db.client;
const EmailDb = db.emailSync;
const app = express();

// Set up HTTPS server
const server = require("https").createServer(app);

// Initialize socket.io server
const io = socketIo(server, { cors: { origin: "*" } });

// Keep track of socket connections
const connections = {};

// Listen for connections
io.on('connection', (socket) => {
    console.log('A client connected');

    // Handle verification of admin
    socket.on('verifyAdmin', async (token) => {
        try {
            if (!token) {
                throw new Error('Missing token');
            }

            const payload = helper.jwtDecode(token, jwtTokenUser);
            if (!payload) {
                throw new Error('Invalid token');
            }

            const adminId = payload.subject._id;

            const admin = await db.admin.findById(adminId);
            if (!admin) {
                socket.emit('verifyAdmin', "unAuthorized");
            } else {
                socket.emit('verifyAdmin', "Authorized");
            }
        } catch (error) {
            console.error('Error verifying admin:', error.message);
            socket.emit('verifyAdmin', "unAuthorized");
        }
    });

    // Handle blocking/unblocking of clients by admin
    socket.on('blockAdmin', async (obj) => {
        try {
            const { clientId, type, token } = obj
            const payload = helper.jwtDecode(token, jwtTokenUser)

            const adminId = payload.subject._id;

            const admin = await db.admin.findById(adminId);
            if (!admin) {
                io.emit('blockAdmin', "Admin not found");
            }

            let clientData = await client.findById(clientId);
            if (!clientData) {
                socket.emit('blockAdmin', { status: false, msg: "Client not found" })
            }

            if (type === "unBlock") {
                clientData.blocked = false;
                clientData.wrongAttempts = 0;
            } else if (type === "Block") {
                clientData.blocked = true;
            } else {
                socket.emit('blockAdmin', { status: false, msg: "Invalid type" })

            }

            const updatedClient = await clientData.save();
            socket.emit('blockAdmin', { status: true, msg: type === "unBlock" ? "Client Unblocked Successfully" : "Client Blocked Successfully", response: updatedClient })

        } catch (error) {
            console.error('Error blocking/unblocking client:', error.message);
            socket.emit('blockAdmin', { status: false, msg: error.message });
        }
    });

    socket.on('addUser', userId => {
        if (userId === "offline") {
            io.emit('userslist', array);
        }
        else {
            let dec = helper.jwtDecode(userId)
            let adminId = dec.subject._id;

            const isAdminExist = array.find(user => user.adminId === adminId);
            if (!isAdminExist) {
                const user = { adminId: adminId, socketId: socket.id };
                array.push(user);
                io.emit('userslist', array);
            }
        }
    });
    let lastUserActiveTimestamp = 0;
    const throttleInterval = 5000; // Set your desired throttling interval in milliseconds


    // Handle user activity status
    socket.on('userActive', async (data) => {
        try {
            const now = Date.now();
            if (now - lastUserActiveTimestamp >= throttleInterval) {
                // Throttle the event emission
                lastUserActiveTimestamp = now;

                let decode = helper.jwtDecode(data.Authorization.split(' ')[1]);
                let userId = decode.subject._id;
                const result = await client.findOne({ _id: new mongoose.Types.ObjectId(userId) });

                if (result) {
                    console.log("useractive data", data)
                    if (data.msg === "inactive") {
                        // Set user inactive
                        client.findOneAndUpdate(
                            { _id: new mongoose.Types.ObjectId(userId) },
                            { '$set': { activeStatus: false } }
                        ).then(resul => {
                            if (resul) {
                                socket.broadcast.emit("userActive", "inactive", { status: false });
                            } else {
                                socket.broadcast.emit("userActive", "error");
                            }
                        });
                    } else if (data.msg === "active") {
                        // Set user active
                        client.findOneAndUpdate(
                            { _id: new mongoose.Types.ObjectId(userId) },
                            { '$set': { activeStatus: true } }
                        ).then(resul => {
                            if (resul) {
                                socket.broadcast.emit("userActive", "active", { status: true, userId, result });
                            } else {
                                socket.broadcast.emit("userActive", "error");
                            }
                        });
                    }
                } else {
                    socket.broadcast.emit("userActive", "User not Found");
                }
                users[socket.id] = userId;
            } else {
                console.log('Event throttled, too many events in a short time.');
            }
        } catch (error) {
            console.error('Error updating user activity status:', error.message);
        }
    });

    // Handle user block status
    socket.on('UserBlockStatus', async (data) => {
        try {
            var params = JSON.parse(data)
            const type = params.type;
            const clientId = params.clientId;
            const token = params.token;

            let decode = helper.jwtDecode(token.split(' ')[1])
            let adminId = decode.subject._id;

            const admin = await db.admin.findById(adminId);
            if (!admin) {
                return socket.broadcast.emit('userBlockedStatus', { status: false, message: "Admin not found" });
            }

            let clientData = await client.findById(clientId);
            if (!clientData) {
                return socket.broadcast.emit('userBlockedStatus', { status: false, message: "Client not found" });
            }

            // Emit 'userBlockedStatus' event to the connected socket
            if (type === "unBlock") {
                clientData.blocked = false;
                clientData.wrongAttempts = 0;
            } else if (type === "Block") {
                clientData.blocked = true;
                clientData.ynEmailSyncStatus = false;
                clientData.ynSync = false;

            } else {
                return socket.broadcast.emit('userBlockedStatus', { status: false, message: "Invalid type" });
            }

            const updatedClient = await clientData.save();

            socket.broadcast.emit('userBlockedStatus', { status: true, message: `${type} Successfully`, response: updatedClient });
            // socket.emit('userBlockedStatus', { status: true, message: `${type} Successfully`, response: updatedClient });

        } catch (error) {
            console.error('Error updating user block status:', error.message);
            socket.broadcast.emit('userBlockedStatus', { status: false, message: error.message });
        }
    });

    // Handle SMS synchronization
    socket.on('smsSync', async (data) => {
        try {
            console.log("smssync*****")
            let decode = helper.jwtDecode(data.Authorization.split(' ')[1]);
            let userId = decode.subject._id;
            const result = await client.findOneAndUpdate(userId);
            if (result) {
                let updates = {
                    ynSync: data.msg === "smsSyncActive" ? true : false
                }
                client.findOneAndUpdate(
                    { _id: new mongoose.Types.ObjectId(userId) },
                    { '$set': updates }
                ).then(resul => {
                    if (resul) {
                        socket.emit("smsSync", { status: true, userId, updates });
                    } else {
                        socket.emit("smsSync", { status: false });
                    }
                });
            }
        } catch (error) {
            console.error('Error handling SMS synchronization:', error.message);
            socket.emit("smsSync", { status: false, msg: error.message });
        }
    });

    // Handle email synchronization
    socket.on('emailSync', async (data) => {
        try {
            console.log("emailSync*****")
            let decode = helper.jwtDecode(data.Authorization.split(' ')[1]);
            let userId = decode.subject._id;
            const result = await client.findOneAndUpdate(userId);
            if (result) {
              let updates = {
                ynEmailSyncStatus: data.msg === "emailSyncActive" ? true : false
              }
               client.findOneAndUpdate(
                   { _id: new mongoose.Types.ObjectId(userId) },
                   { '$set': updates }
                 ).then(resul => {
                   if (resul) {
                     socket.emit("emailSync", {status:true,userId,updates});
                   } else {
                     socket.emit("emailSync",{status:false});
                   }
                 });
             }        } catch (error) {
            console.error('Error handling email synchronization:', error.message);
            socket.emit("emailSync", { status: false, msg: error.message });
        }
    });

    // Handle MPIN generation
    socket.on('mpinGenerate', async (data) => {
        try {
            console.log("mpinGenerate*****");
            let userId = data.userId;
            const clientData = await client.findOne({ _id: userId });
      
            if (clientData && clientData.ownerId && clientData.ownerId.length > 0) {
              let updates = {
                mpinStatus: data.msg === "mpinGenerateActive" ? true : false
              };
              client.findOneAndUpdate(
                { _id: new mongoose.Types.ObjectId(userId) },
                { '$set': updates }
              ).then(result => {
                if (result) {
                  clientData.ownerId.forEach(id => {
                    if (id) {
                      // io.sockets[id].emit("mpinGenerate", { status: true, userId, updates });
                      socket.broadcast.to(id).emit("mpinGenerate", { status: true, userId, updates });
                    }
                  });
                } else {
                  socket.emit("mpinGenerate", { status: false });
                }
              });
      
            } else {
              socket.emit("mpinGenerate", { status: false });
            }        } catch (error) {
            console.error('Error generating MPIN:', error.message);
            socket.emit("mpinGenerate", { status: false, msg: error.message });
        }
    });

    // Handle sending messages to users
    socket.on('getUsers', async (resp) => {
        try {
            let decode = helper.jwtDecode(resp.Authorization.split(' ')[1])
            const clientId = decode.subject._id;
            // const clientId = resp.clientId;
      
            await db.SentMessage.find({ 'userId': clientId }).sort({ _id: -1 }).limit(1)
              .then((msgResp) => {
                if (msgResp.length > 0 ) {
                  const data = msgResp
                  const result = db.client.findById(clientId)
                    .then((resultt)=>{
                      const ownerId = resultt.ownerId
                      for (const e of ownerId){
      
                        const result =  db.admin.find({ ownerId: e })
                          .then(()=>{
                            socket.emit('notification',data)
                            io.socket.emit('notification',data)
                          })
                      }
                    })
                }
                else {
                  db.SentMessage.insertMany(resp.msg).then(resultt => {
                    if (resultt != "") {
                      io.sockets.emit('hello', "New messages updated successfully")
                    } else {
                      io.sockets.emit('hello', "New messages not updated")
                    }
                  }).catch(error => {
                    io.sockets.emit('hello', 'something went wrong')
                  })
                }
              })
              } catch (error) {
            console.error('Error sending messages to users:', error.message);
            socket.emit('hello', 'something went wrong');
        }
    });

    // Handle end
    socket.on('end', function () {
        socket.disconnect(0);
      });
  
    // Handle disconnections
    socket.on('disconnect', () => {
        try {
            if (connections.hasOwnProperty(adminId)) {
                delete connections[adminId]
              }      
              console.log("disconnect entry");
              const userId = users[socket.id];
              const updates = { activeStatus: false, }
              console.log('disconnect_userId: ', userId);
              client.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(userId) }, { '$set': updates }).then(res => {
                if (res) {
                  socket.broadcast.emit("userActive", { status:false,userId });
                } else {
                  socket.broadcast.emit("userActive", { status:false,userId,updates });
                }
              })        } catch (error) {
            console.error('Error handling disconnection:', error.message);
        }
    });
});

// Function to handle socket connections
const connectSocket = (server) => {
    // Create socket.io server
    const io = require('socket.io')(server);

    // Keep track of connected sockets
    const connectedSockets = new Map();

    // Listen for connections
    io.on('connection', (socket) => {
        // Handle new connections
        console.log('A client connected:', socket.id);

        // Store socket reference
        connectedSockets.set(socket.id, socket);

        // Handle disconnections
        socket.on('disconnect', () => {
            console.log('A client disconnected:', socket.id);
            // Remove socket reference
            connectedSockets.delete(socket.id);
        });

        // Add more event handlers as needed
        // Example:
        // socket.on('chatMessage', handleChatMessage);
    });

    // Function to broadcast a message to all connected sockets
    const broadcastMessage = (eventName, data) => {
        connectedSockets.forEach((socket) => {
            socket.emit(eventName, data);
        });
    };

    // Return socket.io instance for further customization if needed
    return io;
};


module.exports = { connectSocket, io };
