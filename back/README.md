# Alten E-commerce Backend API

This is the backend API for the Alten E-commerce application. It provides endpoints for user authentication, product management, shopping cart, and wishlist functionality.

## Technologies Used

- Node.js
- TypeScript
- Express.js
- Sequelize ORM
- SQLite Database
- JSON Web Tokens (JWT) for authentication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file in the root directory with the following variables:

```
PORT=3000
JWT_SECRET=alten_ecommerce_secret_key_2025
```

### Running the Application

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm run build
npm start
```

## API Documentation

The API is documented using Swagger. Once the server is running, you can access the documentation at:

```
http://localhost:3000/swagger
```

This interactive documentation allows you to:
- View all available endpoints
- See request and response schemas
- Test the API directly from the browser

## API Endpoints

### Authentication

- `POST /api/account` - Register a new user
- `POST /api/token` - Login and get JWT token

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a specific product
- `POST /api/products` - Create a new product (admin only)
- `PATCH /api/products/:id` - Update a product (admin only)
- `DELETE /api/products/:id` - Delete a product (admin only)

### Cart

- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add product to cart
- `DELETE /api/cart/:productId` - Remove product from cart
- `PATCH /api/cart/:productId` - Update product quantity in cart

### Wishlist

- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist` - Add product to wishlist
- `DELETE /api/wishlist/:productId` - Remove product from wishlist

## Database Schema

The application uses the following data models:

- User
- Product
- Cart
- CartItem
- Wishlist

## Authentication

The API uses JWT for authentication. To access protected endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer your_jwt_token
```

## Admin Access

Admin users have additional privileges such as creating, updating, and deleting products. The user with email `admin@admin.com` is automatically assigned admin privileges. 