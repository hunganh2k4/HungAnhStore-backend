import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Res,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import type { Response } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Get(':orderId/url')
  getPaymentUrl(@Param('orderId') orderId: string) {
    return this.paymentService.getPaymentUrl(orderId);
  }

  @Get(':orderId/status')
  getStatus(@Param('orderId') orderId: string) {
    return this.paymentService.getStatus(orderId);
  }

  @Get('vnpay/return')
  async vnpayReturn(@Query() query: any, @Res() res: Response) {
    const result = await this.paymentService.vnpayReturn(query);
    res.send(result);
  }

  @Get('vnpay/ipn')
  async vnpayIpnGet(@Query() query: any) {
    return this.paymentService.vnpayIpn(query);
  }

  @Post('vnpay/ipn')
  async vnpayIpnPost(@Body() body: any) {
    return this.paymentService.vnpayIpn(body);
  }
}
