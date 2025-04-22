
# 🍽️ Food Ordering App – API Documentation


## 🍽️ Products

GET /products               # List all food items
GET /products/popular       # List popular items
GET /products/:id           # Get food item details

---

## 🛒 Cart

GET    /cart                # Get current cart
POST   /cart                # Add item to cart
PUT    /cart/:id            # Update cart item quantity
DELETE /cart/:id            # Remove item from cart

---

## ❤️ Favorites

GET    /favorites                   # List all favorite products
POST   /favorites                   # Add product to favorites
DELETE /favorites/:productId        # Remove product from favorites

---

## 📦 Orders

GET  /orders               # List user’s past orders
GET  /orders/:id           # Get order detail
POST /orders               # Create new order

---

## 💳 Payments

POST /payments                    # Create payment for an order
GET  /payments/:orderId/status    # Get payment status

---

## ✅ API Summary Table

| Module      | Endpoints |
|-------------|-----------|
| Products    | 3         |
| Cart        | 4         |
| Favorites   | 3         |
| Orders      | 3         |
| Payments    | 2         |

---

## 🔄 Optional Future Enhancements

- `/products?search=...` for search
- `/products?sort=price&filter=veg` for sorting/filtering
- `/orders/:id/verify` for QR scan verification

