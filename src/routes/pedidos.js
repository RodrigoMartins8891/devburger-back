// src/routes/pedidos.js

import express from 'express';
import { PedidosController } from '../controllers/PedidosController.js';
import { auth } from '../middlewares/auth.js';
import { pool } from '../config/database.js';
import { io } from '../../server.js';
import { isAdmin } from '../middlewares/isAdmin.js';


const router = express.Router();
const controller = new PedidosController();

// ───────── ROTAS ─────────

// Criar pedido (rota protegida)
router.post('/', auth, (req, res) => {
    return controller.criar(req, res);
});

// Listar todos pedidos do usuário logado
router.get('/', auth, async (req, res) => {
    try {
        const usuarioId = req.usuario.id;

        const [rows] = await pool.query(
            'SELECT * FROM pedidos WHERE usuario_id = ?',
            [usuarioId]
        );

        return res.json(rows);

    } catch (e) {
        console.error('Erro ao listar pedidos:', e);
        return res.status(500).json({ erro: 'erro ao listar pedidos' });
    }
});

// Buscar pedido por ID com itens
router.get('/:id', auth, async (req, res) => {
    try {
        const pedidoId = req.params.id;

        const [pedidoRows] = await pool.query(
            'SELECT * FROM pedidos WHERE id = ?',
            [pedidoId]
        );

        const pedido = pedidoRows[0];

        if (!pedido) {
            return res.status(404).json({ erro: 'pedido não encontrado' });
        }

        
        if (pedido.usuario_id !== req.usuario.id) {
            return res.status(403).json({ erro: 'sem permissão para este pedido' });
        }

        
        const [itens] = await pool.query(
            'SELECT * FROM pedido_itens WHERE pedido_id = ?',
            [pedidoId]
        );

        return res.json({
            ...pedido,
            itens
        });

    } catch (e) {
        console.error('Erro ao buscar pedido:', e);
        return res.status(500).json({
            erro: 'erro ao buscar pedido',
            detalhe: e.message
        });
    }
});

// Buscar histórico de status do pedido
router.get('/:id/historico', auth, async (req, res) => {
    try {
        const pedidoId = req.params.id;

        const [historico] = await pool.query(
            'SELECT status, criado_em FROM pedido_status_historico WHERE pedido_id = ? ORDER BY criado_em',
            [pedidoId]
        );

        return res.json(historico);

    } catch (e) {
        console.error(e);
        return res.status(500).json({ erro: 'erro ao buscar histórico' });
    }
});


// Alterar status do pedido (rota protegida)
router.patch('/:id/status', auth, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const pedidoId = req.params.id;

        const statusPermitidos = [
            'RECEBIDO',
            'EM_PREPARO',
            'ENVIADO',
            'FINALIZADO'
        ];

        if (!statusPermitidos.includes(status)) {
            return res.status(400).json({ erro: 'status inválido' });
        }

        // Atualiza status
        await pool.query(
            'UPDATE pedidos SET status = ? WHERE id = ?',
            [status, pedidoId]
        );

        // Salva histórico
        await pool.query(
            'INSERT INTO pedido_status_historico (pedido_id, status) VALUES (?, ?)',
            [pedidoId, status]
        );

        // 🔥 BUSCA O PEDIDO ATUALIZADO
        const [rows] = await pool.query(
            'SELECT * FROM pedidos WHERE id = ?',
            [pedidoId]
        );

        const pedidoAtualizado = rows[0];

        // 🔥 EMITE EVENTO EM TEMPO REAL
        console.log('🔥 EMITINDO EVENTO pedido-status-atualizado', pedidoAtualizado);
        
        io.emit('pedido-status-atualizado', pedidoAtualizado);

        return res.json({
            pedidoId,
            novo_status: status
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ erro: 'erro ao atualizar status' });
    }
});

// LISTAR TODOS OS PEDIDOS (ADMIN)
router.get('/admin/todos', auth, isAdmin, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                p.id,
                p.usuario_id,
                u.nome AS usuario_nome,
                p.status,
                p.total,
                p.criado_em
            FROM pedidos p
            JOIN usuarios u ON u.id = p.usuario_id
            ORDER BY p.criado_em DESC
        `);

        return res.json(rows);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ erro: 'erro ao listar pedidos admin' });
    }
});



export default router;
