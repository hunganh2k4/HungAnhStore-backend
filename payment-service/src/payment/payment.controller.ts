import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /** Lấy URL thanh toán VNPay cho order (sau khi order đã reserved) */
  @Get(':orderId/url')
  async getPaymentUrl(@Param('orderId') orderId: string) {
    const result = await this.paymentService.getPaymentUrl(orderId);
    if (!result) {
      return {
        success: false,
        message: 'Payment URL chua san sang. Vui long doi vai giay va thu lai.',
      };
    }
    return { success: true, url: result.url };
  }

  /** Kiểm tra trạng thái thanh toán */
  @Get(':orderId/status')
  async getStatus(@Param('orderId') orderId: string) {
    const result = await this.paymentService.getStatus(orderId);
    if (!result) {
      return { success: false, message: 'Khong tim thay payment' };
    }
    return { success: true, ...result };
  }

  /**
   * VNPay Return URL - User được redirect về đây sau khi thanh toán
   * Trả về HTML để redirect user về frontend
   */
  @Get('vnpay/return')
  async vnpayReturn(
    @Query() query: Record<string, string>,
    @Res() res: Response,
  ) {
    try {
      const result = await this.paymentService.handleVnPayReturn(query);

      // Trả về trang HTML đơn giản thông báo kết quả
      const frontendUrl =
        process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/payment/result?orderId=${result.payment.orderId}&success=${result.isSuccess}`;

      res.status(HttpStatus.OK).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Ket qua thanh toan</title>
        </head>
        <body>
          <h2>${result.message}</h2>
          <p>Ma don hang: ${result.payment.orderId}</p>
          <p>Trang thai: ${result.payment.status}</p>
          <p><a href="${redirectUrl}">Quay ve trang chu</a></p>
          <script>setTimeout(function(){ window.location.href="${redirectUrl}"; }, 3000);</script>
        </body>
        </html>
      `);
    } catch (err: any) {
      res.status(HttpStatus.BAD_REQUEST).send(`
        <html><body><h2>Loi: ${err?.message || 'Invalid request'}</h2></body></html>
      `);
    }
  }

  /**
   * VNPay IPN URL - VNPay gọi server-to-server để xác nhận
   * Trả về JSON theo format VNPay yêu cầu
   */
  @Post('vnpay/ipn')
  async vnpayIpn(@Req() req: Request, @Res() res: Response) {
    const query = req.method === 'POST' ? req.body : req.query;
    const result = await this.paymentService.handleVnPayIpn(
      typeof query === 'object' ? query : {},
    );
    res.status(HttpStatus.OK).json(result);
  }
}
