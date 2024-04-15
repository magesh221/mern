const http = require("http");
const fs = require("fs");
const db = require('../models/index')
const express = require("express")
const app = express()
// const socketIO = require('socket.io');
var mongoose = require('mongoose');
const { log } = require("console");
const client = db.client;
const EmailDb = db.emailSync;
const https = require("https");
var jwt = require("jsonwebtoken");
var keyfile = require("../config/keyfile");
var jwtTokenUser = keyfile.JWT_SECRET;
const helper = require('../helpers/common');
const { ConsoleLogEntry } = require("selenium-webdriver/bidi/logEntries");
const socketIo = require('socket.io');

// Initialize the socket.io server
const io = socketIo();

// Listen for connections
io.on('connection', (socket) => {
  console.log('A client connected');

  return io
});

const connectSocket = (server) => {
  let array = []
  const users = {};


  server.listen(process.env.PORT, () => {

    console.log(`HTTPS server is running on ${process.env.PORT}`);
  });
  const io = socketIo(server, { cors: { origin: "*", }, });

  io.listen(8500)
  const connections = new Map();

  io.on('connection', (socket) => {

    var token = socket.handshake.headers.auth

    const payload = helper.jwtDecode(token,jwtTokenUser)
    console.log("connectSocket -> payload ----------------------------", payload)
    var adminId = payload.subject._id;
    connections.set(adminId, socket.id);

    const con = connections.get(adminId)
    if(con){
    io.to(con).emit('message', 'Hello!');
}


    socket.on('end', function () {
      socket.disconnect(0);
    });

    socket.on('disconnect', () => {
      connections.delete(adminId);    
      console.log("disconnect entry");
      const userId = users[socket.id];
      const updates = { activeStatus: false, }
      console.log('disconnect_userId: ', userId);
      client.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(userId) }, { '$set': updates }).then(res => {
        if (res) {
          socket.broadcast.emit("userActive", { status: false, userId });
        } else {
          socket.broadcast.emit("userActive", { status: false, userId, updates });
        }
      })
    });
  })


}
module.exports = { connectSocket, io }
