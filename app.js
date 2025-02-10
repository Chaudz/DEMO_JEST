const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const app = express();
app.use(bodyParser.json());

// Giả lập database
let users = [{ id: 1, username: "admin", password: "admin123" }];

let products = [
  { id: 1, name: "Laptop", price: 1000 },
  { id: 2, name: "Phone", price: 500 },
];

// Secret key cho JWT
const SECRET_KEY = "your-secret-key";

// Middleware xác thực token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token không tồn tại" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Token không hợp lệ" });
    req.user = user;
    next();
  });
};

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
  }

  const token = jwt.sign({ username: user.username, id: user.id }, SECRET_KEY);
  res.json({ token });
});

// Logout (Client-side sẽ xóa token)
app.post("/logout", authenticateToken, (req, res) => {
  res.json({ message: "Đăng xuất thành công" });
});

// CRUD Operations
// Create - Thêm sản phẩm mới
app.post("/products", authenticateToken, (req, res) => {
  const { name, price } = req.body;
  const newProduct = {
    id: products.length + 1,
    name,
    price,
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Read - Lấy danh sách sản phẩm
app.get("/products", authenticateToken, (req, res) => {
  res.json(products);
});

// Read - Lấy chi tiết một sản phẩm
app.get("/products/:id", authenticateToken, (req, res) => {
  const product = products.find((p) => p.id === parseInt(req.params.id));
  if (!product)
    return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
  res.json(product);
});

// Update - Cập nhật sản phẩm
app.put("/products/:id", authenticateToken, (req, res) => {
  const { name, price } = req.body;
  const product = products.find((p) => p.id === parseInt(req.params.id));

  if (!product)
    return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

  product.name = name || product.name;
  product.price = price || product.price;

  res.json(product);
});

// Delete - Xóa sản phẩm
app.delete("/products/:id", authenticateToken, (req, res) => {
  const index = products.findIndex((p) => p.id === parseInt(req.params.id));

  if (index === -1)
    return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

  products.splice(index, 1);
  res.json({ message: "Xóa sản phẩm thành công" });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại port ${PORT}`);
});

module.exports = app;
