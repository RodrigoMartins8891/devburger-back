// src/controllers/PedidosController.js

import { pool } from '../config/database.js';
import { ProdutosRepository } from '../repositories/ProdutosRepository.js';

const repoProdutos = new ProdutosRepository();

export class PedidosController {

    async criar(req, res) {

        try {

            // ✅ USUÁRIO VEM DO TOKEN
            const usuarioId = req.usuario.id;
            const { itens } = req.body;

            // ───────── VALIDAÇÕES INICIAIS ─────────

            if (!itens || itens.length === 0) {
                return res.status(400).json({
                    erro: 'pedido deve ter ao menos um item'
                });
            }

            // ───────── VALIDAÇÃO DE PRODUTOS ─────────

            const itensValidados = [];

            for (const item of itens) {

                const produto = await repoProdutos.buscarPorId(
                    item.produto_id
                );

                if (!produto) {
                    return res.status(400).json({
                        erro: `produto ${item.produto_id} não encontrado`
                    });
                }

                if (!produto.disponivel) {
                    return res.status(400).json({
                        erro: `produto ${produto.nome} indisponível`
                    });
                }

                if (item.quantidade <= 0) {
                    return res.status(400).json({
                        erro: 'quantidade deve ser maior que zero'
                    });
                }

                itensValidados.push({
                    produto_id: produto.id,
                    quantidade: item.quantidade,
                    valor_unit: produto.valor
                });
            }

            // ───────── CÁLCULO DO TOTAL ─────────

            let total = 0;

            for (const i of itensValidados) {
                total += i.quantidade * i.valor_unit;
            }

            // ───────── INSERT DO PEDIDO ─────────

            const [pedido] = await pool.query(
                `INSERT INTO pedidos
                 (usuario_id, total, status)
                 VALUES (?, ?, ?)`,
                [usuarioId, total, 'RECEBIDO']
            );

            const pedidoId = pedido.insertId;

            // ───────── INSERT DOS ITENS ─────────

            for (const item of itensValidados) {

                await pool.query(
                    `INSERT INTO pedido_itens
                     (pedido_id, produto_id, quantidade, valor_unit)
                     VALUES (?, ?, ?, ?)`,
                    [
                        pedidoId,
                        item.produto_id,
                        item.quantidade,
                        item.valor_unit
                    ]
                );
            }

            // ───────── RETORNO FINAL ─────────

            return res.status(201).json({
                pedidoId,
                total,
                status: 'RECEBIDO'
            });

        } catch (e) {

            console.error('Erro ao criar pedido:', e.message);

            return res.status(500).json({
                erro: 'erro interno ao criar pedido'
            });
        }
    }
}
