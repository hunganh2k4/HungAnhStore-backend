# Payment Service - VNPay Sandbox

Service xử lý thanh toán VNPay, tích hợp với Order Service qua Kafka.

## Flow thanh toán

1. User tạo đơn với `paymentMethod: ONLINE` → Order Service tạo order
2. Order Service publish `order.created` → Inventory reserve
3. Inventory reserved → Order Service publish `payment.process` { orderId, amount }
4. **Payment Service** nhận `payment.process` → tạo Payment, sinh VNPay URL
5. Frontend gọi `GET /payment/:orderId/url` → redirect user tới VNPay
6. User thanh toán trên VNPay → VNPay redirect về Return URL hoặc gọi IPN
7. Payment Service xử lý, publish `payment.succeeded` / `payment.failed`
8. Order Service cập nhật trạng thái đơn

## Cấu hình VNPay Sandbox

1. Đăng ký tài khoản sandbox: **http://sandbox.vnpayment.vn/devreg/**
2. Nhận email với:
   - `vnp_TmnCode` (Mã website)
   - `vnp_HashSecret` (Chuỗi bí mật)
3. Copy vào `.env`:

```
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
```

## API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/payment/:orderId/url` | Lấy URL thanh toán VNPay |
| GET | `/payment/:orderId/status` | Kiểm tra trạng thái thanh toán |
| GET | `/payment/vnpay/return` | VNPay redirect user về (callback) |
| POST | `/payment/vnpay/ipn` | VNPay gọi server-to-server (IPN) |

## Chạy service

```bash
# Tạo .env từ .env.example
cp .env.example .env
# Sửa DB_NAME, VNPAY_TMN_CODE, VNPAY_HASH_SECRET

# Cài đặt & chạy
npm install
npm run start:dev
```

Service chạy mặc định port **4008**.

## Test với Sandbox

- URL thanh toán: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`
- VNPay Sandbox cho phép thanh toán ảo, không cần thẻ thật
- Return URL phải accessible: dùng `PAYMENT_BASE_URL` đúng (localhost ok cho Return, IPN cần public URL nếu test từ VNPay server)

### Test IPN từ xa

Nếu muốn test IPN (VNPay gọi về server của bạn), cần URL public:
- Dùng **ngrok**: `ngrok http 4008` → copy URL vào `PAYMENT_BASE_URL`
- Cấu hình IPN URL trong merchant VNPay sandbox (nếu có)
