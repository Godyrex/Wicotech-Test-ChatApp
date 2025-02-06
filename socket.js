const socketIo = require('socket.io');
const Message = require('./models/Message');

module.exports = (server) => {
  const io = socketIo(server, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    console.log('New client connected');

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
      // io.to({from: data.from, to: data.to}).emit('receivePrivateMessage', message);
      io.emit('receivePrivateMessage', message);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};