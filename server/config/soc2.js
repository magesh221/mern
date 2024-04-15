// Assuming you have a Map to store user IDs and their corresponding socket IDs
const userSocketMap = new Map();

// When a new user connects, store their socket ID
io.on('connection', (socket) => {
    console.log('A user connected');
    
    // Assuming you have a user ID associated with the socket
    const userId = socket.request.session.userId; // This is just an example, adjust it to your actual user ID retrieval mechanism
    
    // Store the user's socket ID
    userSocketMap.set(userId, socket.id);
    
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected');
        // Remove the user's entry from the map when they disconnect
        userSocketMap.delete(userId);
    });
});

// When you want to send a message to a specific user
const userId = '123'; // Example user ID
const socketId = userSocketMap.get(userId);
if (socketId) {
    io.to(socketId).emit('message', 'Hello!');
} else {
    console.log('User is not connected');
}
