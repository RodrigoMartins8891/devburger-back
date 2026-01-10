import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';

const router = Router();

/* =========================
    REGISTER
========================= */
router.post('/register', async (req, res) => {
    try {
        const { nome, email, senha, is_admin } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({
                erro: 'nome, email e senha são obrigatórios'
            });
        }

        // verifica se email já existe
        const [existe] = await pool.query(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (existe.length > 0) {
            return res.status(400).json({
                erro: 'email já cadastrado'
            });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const [result] = await pool.query(
            `INSERT INTO usuarios (nome, email, senha, is_admin)
            VALUES (?, ?, ?, ?)`,
            [nome, email, senhaHash, is_admin ? 1 : 0]
        );

        return res.status(201).json({
            id: result.insertId,
            nome,
            email,
            is_admin: is_admin ? 1 : 0
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({
            erro: 'erro ao registrar usuário'
        });
    }
});

/* =========================
    LOGIN
========================= */
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                erro: 'email e senha são obrigatórios'
            });
        }

        const [rows] = await pool.query(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                erro: 'email ou senha inválidos'
            });
        }

        const usuario = rows[0];

        const senhaOk = await bcrypt.compare(senha, usuario.senha);

        if (!senhaOk) {
            return res.status(401).json({
                erro: 'email ou senha inválidos'
            });
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                is_admin: usuario.is_admin
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        return res.json({
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                is_admin: usuario.is_admin
            }
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({
            erro: 'erro no login'
        });
    }
});

export default router;
