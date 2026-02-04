
// @ts-nocheck
const { Injectable } = require('@nestjs/common');


const { Controller, Get, Patch, Param, Body } = require('@nestjs/common');
const { OrdersService } = require('./orders.service');

@Controller('orders')
class OrdersController {
  constructor(ordersService) {
    this.ordersService = ordersService;
  }

  @Get('meus-pedidos/:userId')
  listar(@Param('userId') userId) {
    return this.ordersService.listarPorUsuario(Number(userId));
  }

  @Patch(':id/status')
  atualizarStatus(@Param('id') id, @Body('status') status) {
    return this.ordersService.atualizarStatus(Number(id), status);
  }
}

module.exports = { OrdersController };
