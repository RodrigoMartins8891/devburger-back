import { pool } from '../config/database.js';
import { v2 as cloudinary } from 'cloudinary';

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
    // DELETE /produtos/:id
    async delete(req, res) {
        try {
            const { id } = req.params;

            // 1. Buscar o produto para pegar a URL da imagem
            const [rows] = await pool.query('SELECT imagem FROM produtos WHERE id = ?', [id]);
            const produto = rows[0];

            if (!produto) {
                return res.status(404).json({ erro: 'Produto não encontrado.' });
            }

            // 2. Extrair o public_id da URL do Cloudinary para deletar lá
            // A URL costuma ser: .../v123456/nome_da_imagem.jpg
            if (produto.imagem) {
                const partesUrl = produto.imagem.split('/');
                const arquivoComExtensao = partesUrl[partesUrl.length - 1]; // "nome_da_imagem.jpg"
                const [publicId] = arquivoComExtensao.split('.'); // "nome_da_imagem"

                // Remove a imagem do Cloudinary
                await cloudinary.uploader.destroy(publicId);
            }

            // 3. Deletar o registro no banco de dados
            await pool.query('DELETE FROM produtos WHERE id = ?', [id]);

            return res.json({ mensagem: 'Produto e imagem removidos com sucesso!' });

        } catch (error) {
            console.error('🔥 Erro ao deletar produto:', error);
            return res.status(500).json({ erro: 'Erro interno ao remover produto.' });
        }
    }

}
