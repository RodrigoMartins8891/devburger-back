const { Injectable, NotFoundException } = require('@nestjs/common');
const { InjectRepository } = require('@nestjs/typeorm');

const { Order } = require('./order.entity');
const { OrdersGateway } = require('./orders.gateway');

@Injectable()
class OrdersService {
  constructor(
    @InjectRepository(Order)
    ordersRepository,
    ordersGateway
  ) {
    this.ordersRepository = ordersRepository;
    this.ordersGateway = ordersGateway;
  }

  async listarPorUsuario(userId) {
    return this.ordersRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    });
  }

  async atualizarStatus(id, status) {
    const order = await this.ordersRepository.findOne({
      where: { id }
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    order.status = status;
    await this.ordersRepository.save(order);

    // 🔴 tempo real
    this.ordersGateway.emitirAtualizacaoStatus(order);

    return order;
  }
}

module.exports = { OrdersService };
