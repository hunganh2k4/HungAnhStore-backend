1️⃣ Order Created
order.created
→ inventory.reserve
→ inventory.reserved

Inventory change:

available -= quantity
reserved += quantity
2️⃣ Order Cancelled (Before Ship)
order.cancelled
→ inventory.release
→ inventory.released

Inventory change:

available += quantity
reserved -= quantity

⚠ Không được release nếu đã confirm.

3️⃣ Order Ship
order.ship
→ inventory.confirm
→ inventory.confirmed

Inventory change:

reserved -= quantity

Đây là bước xuất kho thật.