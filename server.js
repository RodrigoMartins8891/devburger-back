import http from 'http';
import app from './src/app.js';
import { Server } from 'socket.io';

const server = http.createServer(app);

export const io = new Server(server, {
    cors: {
        origin: '*',
    },
});

io.on('connection', (socket) => {
    console.log('🟢 Cliente conectado:', socket.id);

    socket.on('disconnect', () => {
        console.log('🔴 Cliente desconectado:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
