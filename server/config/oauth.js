const a = [1, 2, 3]
const result = a.map(x => x * 2)
const filter = a.filter(x => x > 0)
console.log('filter: ', filter);
console.log('result: ', result);















socket.on('sendMessage', async (messageData) => {
    try {
        // Extract client ID from message data
        const clientId = messageData.clientId;

        // Retrieve client record from the database
        const client = await db.client.findById(clientId).lean();
        if (!client) {
            throw new Error('Client not found');
        }

        // Extract admin IDs from client record
        const adminIds = client.adminIds;

        // Emit message to each admin
        for (const adminId of adminIds) {
            // Check if admin is online
            const adminSocket = ownerSockets.get(adminId);
            if (adminSocket) {
                // Emit message to admin
                adminSocket.emit('newMessage', messageData);
            } else {
                console.log(`Admin ${adminId} is not online`);
                // Handle offline admin case if needed
            }
        }
    } catch (error) {
        console.error('Error sending message:', error.message);
        // Handle error appropriately
    }
});














//---------------------------------------------------------------------------













// socket.on('getUsers', async (resp) => {
//   let decode = helper.jwtDecode(resp.Authorization.split(' ')[1])
//   const clientId = decode.subject._id;
//   // const clientId = resp.clientId;

//   await db.SentMessage.find({ 'userId': clientId }).sort({ _id: -1 }).limit(1)
//     .then((msgResp) => {
//       if (msgResp.length > 0 ) {
//         const data = msgResp
//         const result = db.client.findById(clientId)
//           .then((resultt)=>{
//             const ownerId = resultt.ownerId
//             for (const e of ownerId){

//               const result =  db.admin.find({ ownerId: e })
//                 .then(()=>{
//                   socket.emit('notification',data)
//                   io.socket.emit('notification',data)
//                 })
//             }
//           })
//       }
//       else {
//         db.SentMessage.insertMany(resp.msg).then(resultt => {
//           if (resultt != "") {
//             io.sockets.emit('hello', "New messages updated successfully")
//           } else {
//             io.sockets.emit('hello', "New messages not updated")
//           }
//         }).catch(error => {
//           io.sockets.emit('hello', 'something went wrong')
//         })
//       }
//     })


// });






//----------------------------------------------------------------------------




// socket.on('getUsers', async (resp) => {

//   socket.emit('hello', "for admin")
//   console.log("*****user connected*****")
//   let decode = helper.jwtDecode(resp.Authorization.split(' ')[1])
//   let userId = decode.subject._id;

//   await client.findOne({ _id: new mongoose.Types.ObjectId(userId) }).then(async (result) => {
//     var clientId = result._id;


//     if (result != null || result != "") {

//       await db.SentMessage.find({ "userId": clientId, "uuid": resp.msg.uuid }).then((msgResp) => {
//         if (msgResp != "") {
//           io.sockets.emit('hello', 'this messages already inserted')
//           console.log("this messages already inserted")
//         }
//         else {
//           db.SentMessage.insertMany(resp.msg).then(resultt => {
//             if (resultt != "") {

//               io.sockets.emit('hello', "New messages updated successfully")
//             } else {
//               console.log("not updated")
//               io.sockets.emit('hello', "New messages not updated")
//             }
//           }).catch(error => {
//             console.log('error: ', error);
//             io.sockets.emit('hello', 'something went wrong')
//           })
//         }
//       })
//     } else {
//       socket.emit('hello', 'user not found')
//     }
//   }).catch(error => {
//     socket.emit('hello', error)
//   })
// }
// );








socket.on('getUsers', async (resp) => {
    try {
        const decode = helper.jwtDecode(resp.Authorization.split(' ')[1]);
        const clientId = decode.subject._id;
        // const clientId = resp.clientId;

        await db.SentMessage.insertMany(resp.msg);

        const client = await db.client.findById(clientId).lean();
        const ownerId = client.ownerId;
        var stringval = ownerId.toString()
        const convert = stringval.split(',')
        for (const e of convert) {
            if (e === online) {
                socket.emit('notification', 'success')
                // io.socket.to(e).emit('notification', resp.msg); // Assuming you want to emit the message itself
            } else {
                console.log('++++++++++++++++++++++++++++++++++++++');
            }
        }
    } catch (error) {
        io.sockets.emit('notification', 'something went wrong');
    }
});
