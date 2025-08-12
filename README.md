# 🛒 API eCommerce

A scalable, production-ready **REST API** for an e-commerce platform.  
Built with **Node.js**, **Express**, **MongoDB**, and secured by **JWT authentication**.

---

## 🚀 Features

- 🔑 **Authentication & Authorization** (JWT Access + Refresh, Role-based)
- 📦 **Product & Category Management**
- 🛒 **Shopping Cart & Checkout**
- 📜 **Order Tracking**
- 💳 **Payment Integration Ready** (Stripe, VNPay, MoMo, etc.)
- 📊 **Search, Sort, Pagination**
- 🛠 **Admin Tools** with Role-Based Access Control
- 📝 **API Documentation** via Swagger

---

## 🧰 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT, bcrypt
- **Docs:** Swagger (OpenAPI)
- **Dev Tools:** ESLint, Prettier, Nodemon

---

## 📦 Installation

```bash
# Clone the repo
git clone https://github.com/thientrile/API_eCommerce-.git
cd API_eCommerce-

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env   # chỉnh sửa giá trị phù hợp
▶️ Running Locally
bash
Sao chép
Chỉnh sửa
# Development mode
npm run dev

# Production build
npm run build
npm start
📚 API Documentation
Once the server is running, visit:

bash
Sao chép
Chỉnh sửa
http://localhost:8080/docs
🗂 Folder Structure
csharp
Sao chép
Chỉnh sửa
src/
├── config/        # Env, DB connection
├── controllers/   # Request handlers
├── routes/        # API endpoints
├── services/      # Business logic
├── models/        # Mongoose schemas
├── middlewares/   # Auth, validation, error handling
└── utils/         # Helpers
📌 Example Endpoints
Method	Endpoint	Description
POST	/api/v1/auth/register	Register a new user
POST	/api/v1/auth/login	Login & get tokens
GET	/api/v1/products	Get product list
POST	/api/v1/cart	Add item to cart
POST	/api/v1/orders	Place an order

📅 Roadmap
 Payment provider integration

 File uploads (images to Cloudinary/S3)

 Redis cache for faster product loading

 Webhooks for order & payment updates

📝 License
MIT © 2025 Le Thien Tri
