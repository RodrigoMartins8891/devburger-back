const { Module } = require('@nestjs/common');
const { TypeOrmModule } = require('@nestjs/typeorm');

const { Order } = require('./order.entity');
const { OrdersController } = require('./orders.controller');
const { OrdersService } = require('./orders.service');
const { OrdersGateway } = require('./orders.gateway');

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersGateway]
})
class OrdersModule {}

module.exports = { OrdersModule };
