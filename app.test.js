const request = require("supertest");
const app = require("./app"); // Cần export app từ app.js
const jwt = require("jsonwebtoken");

const SECRET_KEY = "your-secret-key";

describe("Authentication Endpoints", () => {
  describe("POST /login", () => {
    it("should login with correct credentials", async () => {
      const res = await request(app).post("/login").send({
        username: "admin",
        password: "admin1243",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
    });

    it("should fail with incorrect credentials", async () => {
      const res = await request(app).post("/login").send({
        username: "wrong",
        password: "wrong",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Sai tên đăng nhập hoặc mật khẩu");
    });
  });

  describe("POST /logout", () => {
    it("should logout successfully with valid token", async () => {
      const token = jwt.sign({ username: "admin", id: 1 }, SECRET_KEY);

      const res = await request(app)
        .post("/logout")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Đăng xuất thành công");
    });

    it("should fail without token", async () => {
      const res = await request(app).post("/logout");

      expect(res.statusCode).toBe(401);
    });
  });
});

describe("Products Endpoints", () => {
  let token;

  beforeEach(() => {
    token = jwt.sign({ username: "admin", id: 1 }, SECRET_KEY);
  });

  describe("GET /products", () => {
    it("should return all products", async () => {
      const res = await request(app)
        .get("/products")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("GET /products/:id", () => {
    it("should return a product by id", async () => {
      const res = await request(app)
        .get("/products/1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("id", 1);
    });

    it("should return 404 for non-existent product", async () => {
      const res = await request(app)
        .get("/products/999")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe("POST /products", () => {
    it("should create a new product", async () => {
      const newProduct = {
        name: "Test Product",
        price: 100,
      };

      const res = await request(app)
        .post("/products")
        .set("Authorization", `Bearer ${token}`)
        .send(newProduct);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("name", newProduct.name);
      expect(res.body).toHaveProperty("price", newProduct.price);
    });
  });

  describe("PUT /products/:id", () => {
    it("should update an existing product", async () => {
      const updateData = {
        name: "Updated Product",
        price: 200,
      };

      const res = await request(app)
        .put("/products/1")
        .set("Authorization", `Bearer ${token}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("name", updateData.name);
      expect(res.body).toHaveProperty("price", updateData.price);
    });

    it("should return 404 for updating non-existent product", async () => {
      const res = await request(app)
        .put("/products/999")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Test" });

      expect(res.statusCode).toBe(404);
    });
  });

  describe("DELETE /products/:id", () => {
    it("should delete an existing product", async () => {
      const res = await request(app)
        .delete("/products/2")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Xóa sản phẩm thành công");
    });

    it("should return 404 for deleting non-existent product", async () => {
      const res = await request(app)
        .delete("/products/999")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });
  });
});
