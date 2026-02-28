1️⃣ ONLINE PAYMENT – SUCCESS
Flow
User tạo order
→ order.created
→ inventory.reserved
→ payment.process (online)
→ payment.success
→ order.confirmed
→ staff set SHIPPING
→ order.ship
→ inventory.confirm
→ order.success
Inventory Changes
Action	available	reserved
reserve	-	+
confirm (ship)		-
2️⃣ ONLINE PAYMENT – FAILED
Flow
order.created
→ inventory.reserved
→ payment.process
→ payment.failed
→ inventory.release
→ order.cancelled (SYSTEM)
Inventory Changes
Action	available	reserved
reserve	-	+
release	+	-
3️⃣ USER CANCEL BEFORE SHIP (ONLINE)
Flow
order.created
→ inventory.reserved
→ payment.success
→ order.confirmed
→ user.cancel
→ inventory.release
→ refund.process
→ order.cancelled (USER)
Rule

Chỉ được cancel khi chưa order.ship

Inventory dùng release

4️⃣ COD ORDER – SUCCESS
Flow
order.created
→ inventory.reserve
→ inventory.reserved
→ order.confirmed (COD)
→ staff set SHIPPING
→ order.ship
→ inventory.confirm
→ shipper giao hàng
→ customer thanh toán
→ order.success
5️⃣ COD – DELIVERY FAILED
Flow
order.ship
→ inventory.confirm
→ delivery.failed
→ inventory.stockIn (RETURN)
→ order.returned
Inventory Changes
Action	available	reserved
confirm		-
stockIn	+	

⚠ Không dùng release vì đã confirm.

6️⃣ USER CANCEL BEFORE SHIP (COD)
Flow
order.created
→ inventory.reserve
→ order.confirmed (COD)
→ user.cancel
→ inventory.release
→ order.cancelled