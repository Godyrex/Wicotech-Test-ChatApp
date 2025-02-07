const socketIo = require('socket.io');
const Message = require('./models/Message');

module.exports = (server) => {
  const io = socketIo(server, { cors: { origin: '*' } });
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('New client connected');

    // Handle user connection
    socket.on('userConnected', (username) => {
      onlineUsers.set(socket.id, username);
      io.emit('updateUserStatus', Array.from(onlineUsers.values()));
      console.log('User connected:', username);
    });

    socket.on('requestMessageHistory', () => {
      Message.find({ type: 'group' }).sort({ createdAt: 1 }).then(messages => {
        socket.emit('messageHistory', messages);
        console.log('Message history sent');
      });
    });

    socket.on('requestPrivateMessageHistory', ({ from, to }) => {
      Message.find({
        type: 'private',
        $or: [
          { from, to },
          { from: to, to: from }
        ]
      }).sort({ createdAt: 1 }).then(messages => {
        socket.emit('privateMessageHistory', messages);
        console.log('Private message history sent');
      });
    });

    socket.on('sendMessage', async (data) => {
      const message = new Message({ from: data.from, text: data.text, type: 'group' });
      if (!message.from || !message.text) {
        console.log('Invalid message');
        console.log(message);
        return;
      }
      await message.save();
      io.emit('receiveMessage', message);
    });

    socket.on('sendPrivateMessage', async (data) => {
      const message = new Message({ from: data.from, to: data.to, text: data.text, type: 'private' });
      if (!message.from || !message.to || !message.text) {
        console.log('Invalid private message');
        console.log(message);
        return;
      }
      await message.save();
      io.emit('receivePrivateMessage', message);
      console.log('Private message sent:', message);
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
      const username = onlineUsers.get(socket.id);
      onlineUsers.delete(socket.id);
      io.emit('updateUserStatus', Array.from(onlineUsers.values()));
      console.log('Client disconnected:', username);
    });
  });
};