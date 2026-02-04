// src/controllers/AuthController.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';

export class AuthController {

    async login(req, res) {

        const { email, senha } = req.body;

        const [rows] = await pool.query(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );

        const usuario = rows[0];

        if (!usuario) {
            return res.status(401).json({ erro: 'usuário não encontrado' });
        }

        const valida = await bcrypt.compare(senha, usuario.senha);

        if (!valida) {
            return res.status(401).json({ erro: 'senha inválida' });
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                is_admin: usuario.is_admin
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );



        return res.json({ token });

    }


    async register(req, res) {

        const { nome, email, senha } = req.body;

        const [existe] = await pool.query(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (existe.length > 0) {
            return res.status(400).json({ erro: 'email já cadastrado' });
        }

        const hash = await bcrypt.hash(senha, 10);

        const [result] = await pool.query(
            'INSERT INTO usuarios (nome, email, senha) VALUES (?,?,?)',
            [nome, email, hash]
        );

        const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                is_admin: usuario.is_admin
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );


        return res.status(201).json({
            id: result.insertId,
            token
        });

    }

}
