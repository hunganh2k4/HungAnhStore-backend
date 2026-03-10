import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

const VNPAY_SANDBOX_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';

export interface VnPayCreateUrlParams {
  orderId: string;
  amount: number; // VND
  orderInfo: string;
  returnUrl: string;
  ipnUrl: string;
  bankCode?: string; // VNBANK, VNPAYQR, INTCARD...
  locale?: 'vn' | 'en';
}

@Injectable()
export class VnpayService {
  private readonly tmnCode: string;
  private readonly hashSecret: string;
  private readonly vnpayUrl: string;

  constructor(private configService: ConfigService) {
    this.tmnCode = this.configService.get<string>('VNPAY_TMN_CODE', 'DEMOV210');
    this.hashSecret = this.configService.get<string>('VNPAY_HASH_SECRET', '');
    this.vnpayUrl = this.configService.get<string>(
      'VNPAY_URL',
      VNPAY_SANDBOX_URL,
    );
  }

  /** Mã hóa giống PHP urlencode: space -> + (VNPay dùng chuẩn application/x-www-form-urlencoded) */
  private urlEncode(str: string): string {
    return encodeURIComponent(str).replace(/%20/g, '+');
  }

  /**
   * Tạo URL thanh toán VNPay (Sandbox)
   * Số tiền gửi sang VNPay = amount * 100 (bỏ phần thập phân)
   */
  createPaymentUrl(params: VnPayCreateUrlParams): string {
    const vnpParams: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.tmnCode,
      vnp_Amount: String(Math.round(params.amount * 100)),
      vnp_CurrCode: 'VND',
      vnp_TxnRef: params.orderId,
      vnp_OrderInfo: params.orderInfo,
      vnp_OrderType: 'other',
      vnp_Locale: params.locale || 'vn',
      vnp_ReturnUrl: params.returnUrl,
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: this.formatDate(new Date()),
      vnp_ExpireDate: this.formatExpireDate(new Date(), 15), // 15 phút
    };

    if (params.bankCode) {
      vnpParams.vnp_BankCode = params.bankCode;
    }

    // Sort params & build hash data (VNPay/PHP: urlencode - space thành +)
    const sortedKeys = Object.keys(vnpParams).sort();
    const signData = sortedKeys
      .map((k) => `${this.urlEncode(k)}=${this.urlEncode(vnpParams[k])}`)
      .join('&');

    const vnpSecureHash = this.hmacSha512(this.hashSecret, signData);
    vnpParams.vnp_SecureHash = vnpSecureHash;

    const query = Object.keys(vnpParams)
      .sort()
      .map((k) => `${this.urlEncode(k)}=${this.urlEncode(vnpParams[k])}`)
      .join('&');

    return `${this.vnpayUrl}?${query}`;
  }

  /**
   * Xác thực chữ ký từ VNPay callback (Return URL & IPN)
   */
  /** Xác thực chữ ký từ query params (Return URL hoặc IPN) */
  verifyReturnUrl(query: Record<string, string>): {
    isValid: boolean;
    vnpTxnRef: string;
    vnpTransactionNo: string;
    vnpResponseCode: string;
    vnpAmount: number;
    vnpBankCode?: string;
    vnpPayDate?: string;
  } {
    const vnpSecureHash = query.vnp_SecureHash;
    const vnpSecureHashType = query.vnp_SecureHashType || 'HMACSHA512';

    if (!vnpSecureHash) {
      return {
        isValid: false,
        vnpTxnRef: query.vnp_TxnRef || '',
        vnpTransactionNo: query.vnp_TransactionNo || '',
        vnpResponseCode: query.vnp_ResponseCode || '99',
        vnpAmount: 0,
      };
    }

    // VNPay hash từ chuỗi đã URL-encode (space -> +), phải build giống vậy
    const signData = Object.keys(query)
      .filter((k) => k.startsWith('vnp_') && k !== 'vnp_SecureHash' && k !== 'vnp_SecureHashType')
      .sort()
      .map((k) => `${this.urlEncode(k)}=${this.urlEncode(String(query[k] ?? ''))}`)
      .join('&');

    let isValid = false;
    if (vnpSecureHashType === 'HMACSHA512') {
      isValid = this.hmacSha512(this.hashSecret, signData) === vnpSecureHash;
    } else {
      const hash = crypto.createHash('sha256').update(this.hashSecret + signData).digest('hex');
      isValid = hash === vnpSecureHash;
    }

    const amount = parseInt(query.vnp_Amount || '0', 10) / 100;

    return {
      isValid,
      vnpTxnRef: query.vnp_TxnRef || '',
      vnpTransactionNo: query.vnp_TransactionNo || '',
      vnpResponseCode: query.vnp_ResponseCode || '99',
      vnpAmount: amount,
      vnpBankCode: query.vnp_BankCode,
      vnpPayDate: query.vnp_PayDate,
    };
  }

  private hmacSha512(secret: string, data: string): string {
    return crypto.createHmac('sha512', secret).update(data).digest('hex');
  }

  private formatDate(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return (
      d.getFullYear() +
      pad(d.getMonth() + 1) +
      pad(d.getDate()) +
      pad(d.getHours()) +
      pad(d.getMinutes()) +
      pad(d.getSeconds())
    );
  }

  private formatExpireDate(d: Date, minutes: number): string {
    const exp = new Date(d.getTime() + minutes * 60 * 1000);
    return this.formatDate(exp);
  }
}
