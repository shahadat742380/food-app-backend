-- User table
CREATE TABLE user (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  email_verified BOOLEAN NOT NULL,
  image TEXT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  role TEXT,
  banned BOOLEAN,
  ban_reason TEXT,
  ban_expires TIMESTAMP,
  phone_number TEXT UNIQUE,
  phone_number_verified BOOLEAN,
  bio TEXT,
  email_notification BOOLEAN,
  two_factor BOOLEAN
);


-- Products (Food Items)
CREATE TABLE products (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    is_popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Cart Items
CREATE TABLE cart_items (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    added_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Favorites
CREATE TABLE favorites (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    is_favorite BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (user_id, product_id)
);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    token_number VARCHAR(50) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    gst DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    order_date TIMESTAMP NOT NULL DEFAULT NOW(),
    status VARCHAR(20) NOT NULL CHECK (status IN ('placed', 'confirmed', 'completed'))
);

-- Order Items (join table for Orders and Products)
CREATE TABLE order_items (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0)
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    method VARCHAR(50) NOT NULL DEFAULT 'UPI',
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    payment_date TIMESTAMP NOT NULL DEFAULT NOW()
);


