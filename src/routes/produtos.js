import express from 'express';
import { ProdutosRepository } from '../repositories/ProdutosRepository.js';
import { upload } from '../config/upload.js';
import { auth } from '../middlewares/auth.js';
import { isAdmin } from '../middlewares/isAdmin.js';

const router = express.Router();
const repo = new ProdutosRepository();

// ───────── LISTAR PRODUTOS ─────────
router.get('/', async (req, res) => {
    const produtos = await repo.listarDisponiveis();
    res.json(produtos);
});

// ───────── CADASTRAR PRODUTO ─────────
router.post(
    '/',
    auth,
    isAdmin,
    upload.single('imagem'),
    async (req, res) => {
        try {
            const { nome, valor, categoria_id } = req.body;
            const imagem = req.file?.filename;

            if (!nome || !valor || !categoria_id) {
                return res.status(400).json({
                    erro: 'nome, valor e categoria_id são obrigatórios'
                });
            }

            if (!imagem) {
                return res.status(400).json({
                    erro: 'imagem é obrigatória'
                });
            }

            const produto = await repo.criar({
                nome,
                valor,
                categoria_id,
                imagem
            });

            return res.status(201).json(produto);

        } catch (e) {
            console.error(e);
            return res.status(500).json({
                erro: 'falha ao cadastrar produto'
            });
        }
    }
);

// ───────── ATUALIZAR IMAGEM ─────────
router.put(
    '/:id/imagem',
    auth,
    isAdmin,
    upload.single('imagem'),
    async (req, res) => {
        try {
            const { id } = req.params;
            const imagem = req.file?.filename;

            if (!imagem) {
                return res.status(400).json({
                    erro: 'imagem é obrigatória'
                });
            }

            const produto = await repo.buscarPorId(id);

            if (!produto) {
                return res.status(404).json({
                    erro: 'produto não encontrado'
                });
            }

            await repo.atualizarImagem(id, imagem);

            return res.json({
                mensagem: 'imagem atualizada com sucesso',
                imagem
            });

        } catch (e) {
            console.error(e);
            return res.status(500).json({
                erro: 'erro ao atualizar imagem'
            });
        }
    }
);

export default router;
