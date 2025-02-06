const http = require('http');
const app = require('./app');
const server = http.createServer(app);
const initializeSocket = require('./socket');

const PORT = process.env.PORT || 5000;

initializeSocket(server);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));