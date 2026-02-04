import express from "express";
import { ProdutosRepository } from "../repositories/ProdutosRepository.js";
import { uploadCloud } from "../config/uploadCloud.js";
import { auth } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();
const repo = new ProdutosRepository();

// ───────── LISTAR PRODUTOS ─────────
router.get("/", async (req, res) => {
  try {
    const produtos = await repo.listarDisponiveis();
    return res.json(produtos);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      erro: "erro ao listar produtos",
    });
  }
});

// ───────── BUSCAR UM PRODUTO PELO ID ─────────
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const produto = await repo.buscarPorId(id);

    if (!produto) {
      return res.status(404).json({ erro: "produto não encontrado" });
    }

    return res.json(produto);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: "erro ao buscar produto" });
  }
});

// ───────── CADASTRAR PRODUTO (CLOUDINARY) ─────────
router.post(
  "/",
  auth,
  isAdmin,
  uploadCloud.single("imagem"),
  async (req, res) => {
    try {
      const { nome, valor, categoria_id } = req.body;

      if (!nome || !valor || !categoria_id) {
        return res.status(400).json({
          erro: "nome, valor e categoria_id são obrigatórios",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          erro: "imagem obrigatória",
        });
      }

      // 👉 URL direta do Cloudinary
      const imagem = req.file.path;

      const produto = await repo.criar({
        nome,
        valor,
        categoria_id,
        imagem,
      });

      return res.status(201).json(produto);
    } catch (e) {
      console.log("🔥 CLOUDINARY ERROR — POST 🔥");
      console.log(e);
      console.log(e.message);
      console.log(e.error);
      console.log(e.stack);

      return res.status(500).json({
        erro: "erro ao cadastrar produto",
        detalhe: e.message || e.error || "erro desconhecido",
      });
    }
  },
);

//-----------ATUALIZAR PRODUTO ─────────
router.put("/:id", auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, valor, categoria_id } = req.body;

    if (!nome || !valor || !categoria_id) {
      return res.status(400).json({
        erro: "nome, valor e categoria_id são obrigatórios",
      });
    }

    const atualizado = await repo.atualizar(id, {
      nome,
      valor,
      categoria_id,
    });

    if (!atualizado) {
      return res.status(404).json({ erro: "produto não encontrado" });
    }

    return res.json({ mensagem: "produto atualizado com sucesso" });
  } catch (e) {
    console.error("🔥 UPDATE ERROR 🔥", e);
    return res.status(500).json({ erro: "erro ao atualizar produto" });
  }
});


// ───────── ATUALIZAR IMAGEM (CLOUDINARY) ─────────
router.put(
  "/:id/imagem",
  auth,
  isAdmin,
  uploadCloud.single("imagem"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!req.file) {
        return res.status(400).json({
          erro: "imagem obrigatória",
        });
      }

      const produto = await repo.buscarPorId(id);

      if (!produto) {
        return res.status(404).json({
          erro: "produto não encontrado",
        });
      }

      const imagem = req.file.path;

      await repo.atualizarImagem(id, imagem);

      return res.json({
        mensagem: "imagem atualizada com sucesso",
        imagem,
      });
    } catch (e) {
      console.log("🔥 CLOUDINARY ERROR — PUT 🔥");
      console.log(e);
      console.log(e.message);
      console.log(e.error);
      console.log(e.stack);

      return res.status(500).json({
        erro: "erro ao atualizar imagem",
        detalhe: e.message || e.error || "erro desconhecido",
      });
    }
  },

  // ───────── DELETAR PRODUTO ─────────
);
router.delete("/:id", auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Busca o produto para conseguir a URL da imagem
    const produto = await repo.buscarPorId(id);

    if (!produto) {
      return res.status(404).json({ erro: "produto não encontrado" });
    }

    // 2. Remove a imagem do Cloudinary
    if (produto.imagem) {
      const partesUrl = produto.imagem.split("/");
      const arquivoComExtensao = partesUrl[partesUrl.length - 1];
      const [publicId] = arquivoComExtensao.split(".");

      await cloudinary.uploader.destroy(publicId);
    }

    // 3. Remove do banco de dados
    await repo.excluir(id);

    return res.json({ mensagem: "produto removido com sucesso" });
  } catch (e) {
    console.error("🔥 DELETE ERROR 🔥", e);
    return res.status(500).json({
      erro: "erro ao deletar produto",
      detalhe: e.message,
    });
  }
});

export default router;
