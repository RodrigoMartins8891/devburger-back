import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import swaggerUi from 'swagger-ui-express';

import { swaggerSpec } from './config/swagger.js';
import authRoutes from './routes/auth.routes.js';
import produtosRoutes from './routes/produtos.js';
import pedidosRoutes from './routes/pedidos.js';
import { uploadError } from './middlewares/uploadError.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
// imagens uploads
app.use('/uploads', express.static(path.resolve('uploads')));
// swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// rotas
app.use('/auth', authRoutes);
app.use('/produtos', produtosRoutes);
app.use('/pedidos', pedidosRoutes);
app.use(uploadError);

export default app;
