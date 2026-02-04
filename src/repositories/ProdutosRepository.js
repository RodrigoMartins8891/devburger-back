import { pool } from "../config/database.js";

export class ProdutosRepository {
  async listarDisponiveis() {
    const [rows] = await pool.query(
      // Adicionamos 'categoria_id' na query abaixo
      "SELECT id, nome, valor, imagem, categoria_id FROM produtos WHERE disponivel = 1",
    );
    return rows;
  }

  async buscarPorId(id) {
    const [rows] = await pool.query("SELECT * FROM produtos WHERE id = ?", [
      id,
    ]);
    return rows.length ? rows[0] : null;
  }

  async criar({ nome, valor, categoria_id, imagem }) {
    const [result] = await pool.query(
      `INSERT INTO produtos
            (nome, valor, categoria_id, imagem, disponivel)
            VALUES (?, ?, ?, ?, true)`,
      [nome, valor, categoria_id, imagem],
    );

    return {
      id: result.insertId,
      nome,
      valor,
      categoria_id,
      imagem,
    };
  }

  async atualizar(id, { nome, valor, categoria_id }) {
    const [result] = await pool.query(
      `UPDATE produtos 
         SET nome = ?, valor = ?, categoria_id = ?
         WHERE id = ?`,
      [nome, valor, categoria_id, id],
    );

    return result.affectedRows > 0;
  }

  async atualizarImagem(id, imagem) {
    await pool.query("UPDATE produtos SET imagem = ? WHERE id = ?", [
      imagem,
      id,
    ]);
  }

  async excluir(id) {
    const [result] = await pool.query(
      "UPDATE produtos SET disponivel = 0 WHERE id = ?",
      [id],
    );

    return result.affectedRows > 0;
  }
}
