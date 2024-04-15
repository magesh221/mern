var token = socket.handshake.auth
if (token) {
  console.log("connectSocket -> token", token)
  const payload = helper.jwtDecode(JSON.stringify(token), jwtTokenUser)
  console.log("connectSocket -> payload", payload)
  var adminId = payload.subject._id;
  connections[adminId] = socket.id;
  console.log(connections, "-----------------------------connections-------------------------------")
}
const online = Object.keys(connections)
console.log('online: ', online);



socket.on('getUsers', async (resp) => {
  try {
    const decode = helper.jwtDecode(resp.Authorization.split(' ')[1]);
    const clientId = decode.subject._id;
  // const clientId = resp.clientId;

    
    await db.SentMessage.insertMany(resp.msg);

    const client = await db.client.findById(clientId).lean();
    const ownerId = client.ownerId;

    for (const e of ownerId) {
      if (e === online){
        console.log('online: ', online);
        
        io.socket.to(e).emit('notification', resp.msg); // Assuming you want to emit the message itself
      }
    }
  } catch (error) {
    io.sockets.emit('hello', 'something went wrong');
  }
});

//----------------------------------------------------------------------------------------------------------------------------------------------------------------


socket.on('getUsers', async (resp) => {

  let decode = helper.jwtDecode(resp.Authorization.split(' ')[1])
  const clientId = decode.subject._id;
  // const clientId = resp.clientId;

  db.SentMessage.insertMany(resp.msg).then(resultt => {

    db.client.findById(clientId)
      .lean()
      .then((data) => {
        const ownerId = data.ownerId
        for (const e of ownerId) {

          socket.to(e).emit('notification', resultt)
        }
      })

  }).catch(error => {
    io.sockets.emit('hello', 'something went wrong')
  })

})




//----------------------------------------------------------------------------------------------------------------------------------------------------------------

socket.on('getUsers', async (resp) => {

  // let decode = helper.jwtDecode(resp.Authorization.split(' ')[1])
  // const clientId = decode.subject._id;
  const clientId = resp.clientId;

  db.SentMessage.insertMany(resp.msg).then(resultt => {
    if (!resultt) {
      io.sockets.emit('notification', "New messages not updated")
    } else {
      io.sockets.emit('notification', "New messages updated successfully")
      db.client.findById(clientId)
        .then((data) => {
          const ownerId = data.ownerId
          for (const e of ownerId) {

            socket.emit('notification', resultt)
            io.socket.emit('notification', resultt)
          }
        })
    }
  }).catch(error => {
    io.sockets.emit('hello', 'something went wrong')
  })
})






//----------------------------------------------------------------------------------------------------------------------------------------------------------------








socket.on('getUsers', async (resp) => {

  let decode = helper.jwtDecode(resp.Authorization.split(' ')[1])
  const clientId = decode.subject._id;
  // const clientId = resp.clientId;

  db.SentMessage.insertMany(resp.msg).then(resultt => {
    if (!resultt) {
      io.sockets.emit('notification', "New messages not updated")
    } else {
      io.sockets.emit('notification', "New messages updated successfully")
      db.client.findById(clientId)
        .then((data) => {
          const ownerId = data.ownerId
          for (const e of ownerId) {
            socket.to(e).emit('notification', resultt)
          }
        })
    }
  }).catch(error => {
    io.sockets.emit('hello', 'something went wrong')
  })
})




//----------------------------------------------------------------------------------------------------------------------------------------------------------------













global.onlineusers = new map
// When a user connects
io.on('connection', (socket) => {
  onlineusers.set(socket.id, {
    userId: socket.handshake.query.userId, socket: socket
  });


  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    console.log(sendUserSocket);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("receive-message", data.message);
    }
  });
})




//----------------------------------------------------------------------------------------------------------------------------------------------------------------
