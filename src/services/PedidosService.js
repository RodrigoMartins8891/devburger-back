// src/services/PedidosService.js
export class PedidosService {

    calcularTotal(itens) {

        let total = 0;

        for (const item of itens) {
            total += item.quantidade * item.valor_unit;
        }

        return total;

    }

}
