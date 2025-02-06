const http = require('http');
const app = require('./app');
const server = http.createServer(app);
const socketIo = require('socket.io');
const Message = require('./models/Message');
const io = socketIo(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 5000;

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('requestMessageHistory', () => {
    Message.find().sort({ createdAt: 1 }).then(messages => {
      socket.emit('messageHistory', messages);
      console.log('Message history sent');
    });
  });

  socket.on('sendMessage', async (data) => {
    const message = new Message({ username: data.username, text: data.text });
    if (!message.username || !message.text) {
      console.log('Invalid message');
      console.log(message);
        return;
    }
    await message.save();
    io.emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));