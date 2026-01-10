import { pool } from '../config/database.js';

export class ProdutosController {

    // GET /produtos
    async index(req, res) {

        const [rows] = await pool.query(`
      SELECT 
        id,
        nome,
        valor,
        categoria_id,
        disponivel,
        imagem,
        criado_em
      FROM produtos
    `);

        return res.json(rows);

    }


    // POST /produtos
    async store(req, res) {

        const {
            nome,
            valor,
            categoria_id,
            disponivel,
            imagem
        } = req.body;

        const [result] = await pool.query(
            `INSERT INTO produtos 
       (nome, valor, categoria_id, disponivel, imagem, criado_em)
       VALUES (?,?,?,?,?, NOW())`,
            [nome, valor, categoria_id, disponivel, imagem]
        );

        const [novo] = await pool.query(
            'SELECT * FROM produtos WHERE id = ?',
            [result.insertId]
        );

        return res.status(201).json(novo[0]);

    }

}
