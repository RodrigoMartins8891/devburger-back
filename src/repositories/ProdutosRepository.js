import { pool } from '../config/database.js';

export class ProdutosRepository {

    async listarDisponiveis() {
        const [rows] = await pool.query(
            'SELECT id, nome, valor, imagem FROM produtos WHERE disponivel = 1'
        );
        return rows;
    }

    async buscarPorId(id) {
        const [rows] = await pool.query(
            'SELECT * FROM produtos WHERE id = ?',
            [id]
        );
        return rows.length ? rows[0] : null;
    }

    async criar({ nome, valor, categoria_id, imagem }) {
        const [result] = await pool.query(
            `INSERT INTO produtos
            (nome, valor, categoria_id, imagem, disponivel)
            VALUES (?, ?, ?, ?, true)`,
            [nome, valor, categoria_id, imagem]
        );

        return {
            id: result.insertId,
            nome,
            valor,
            categoria_id,
            imagem
        };
    }

    async atualizarImagem(id, imagem) {
        await pool.query(
            'UPDATE produtos SET imagem = ? WHERE id = ?',
            [imagem, id]
        );
    }

}
