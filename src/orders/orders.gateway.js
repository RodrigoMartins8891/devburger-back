const {
  WebSocketGateway,
  WebSocketServer
} = require('@nestjs/websockets');

@WebSocketGateway({ cors: { origin: '*' } })
class OrdersGateway {
  @WebSocketServer()
  server;

  emitirAtualizacaoStatus(order) {
    this.server.emit('order-status-updated', order);
  }
}

module.exports = { OrdersGateway };
