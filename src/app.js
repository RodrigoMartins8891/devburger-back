import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/auth.routes.js';
import produtosRoutes from './routes/produtos.js';
import pedidosRoutes from './routes/pedidos.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.resolve('uploads')));

app.use('/auth', authRoutes);
app.use('/produtos', produtosRoutes);
app.use('/pedidos', pedidosRoutes);

export default app;
