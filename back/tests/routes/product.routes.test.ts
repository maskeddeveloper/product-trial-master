import request from "supertest";
import express from "express";
import { Product } from "../../src/models";
import productRoutes from "../../src/routes/product.routes";
import { authenticateJWT, isAdmin } from "../../src/middleware/auth.middleware";

// Mock the authentication middleware
jest.mock("../../src/middleware/auth.middleware", () => ({
  authenticateJWT: jest.fn((req, res, next) => next()),
  isAdmin: jest.fn((req, res, next) => next()),
}));

// Mock the Product model
jest.mock("../../src/models", () => ({
  Product: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
}));

describe("Product Routes", () => {
  let app: express.Application;
  let originalConsoleError: any;

  // Save the original console.error
  beforeAll(() => {
    originalConsoleError = console.error;
    // Replace console.error with a mock function during tests
    console.error = jest.fn();
  });

  // Restore the original console.error after tests
  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/products", productRoutes);
    jest.clearAllMocks();
  });

  describe("GET /api/products", () => {
    it("should return all products", async () => {
      const mockProducts = [
        { id: 1, name: "Product 1", price: 100 },
        { id: 2, name: "Product 2", price: 200 },
      ];

      (Product.findAll as jest.Mock).mockResolvedValue(mockProducts);

      const response = await request(app).get("/api/products");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProducts);
      expect(Product.findAll).toHaveBeenCalled();
    });

    it("should handle errors", async () => {
      (Product.findAll as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).get("/api/products");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Failed to fetch products" });
    });
  });

  describe("GET /api/products/:id", () => {
    it("should return a product by id", async () => {
      const mockProduct = { id: 1, name: "Product 1", price: 100 };

      (Product.findByPk as jest.Mock).mockResolvedValue(mockProduct);

      const response = await request(app).get("/api/products/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProduct);
      expect(Product.findByPk).toHaveBeenCalledWith("1");
    });

    it("should return 404 if product not found", async () => {
      (Product.findByPk as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get("/api/products/999");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Product not found" });
    });

    it("should handle errors", async () => {
      (Product.findByPk as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).get("/api/products/1");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Failed to fetch product" });
    });
  });

  describe("POST /api/products", () => {
    it("should create a new product", async () => {
      const mockProduct = {
        id: 1,
        code: "P001",
        name: "New Product",
        description: "Description",
        image: "image.jpg",
        category: "Category",
        price: 100,
        quantity: 10,
        internalReference: "REF001",
        shellId: 1,
        inventoryStatus: "INSTOCK",
        rating: 4,
      };

      (Product.create as jest.Mock).mockResolvedValue(mockProduct);

      const response = await request(app)
        .post("/api/products")
        .send(mockProduct);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockProduct);
      expect(Product.create).toHaveBeenCalled();
      expect(authenticateJWT).toHaveBeenCalled();
      expect(isAdmin).toHaveBeenCalled();
    });

    it("should handle errors", async () => {
      (Product.create as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).post("/api/products").send({});

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Failed to create product" });
    });
  });

  describe("PATCH /api/products/:id", () => {
    it("should update a product", async () => {
      const mockProduct = {
        id: 1,
        name: "Updated Product",
        update: jest.fn().mockResolvedValue(true),
        reload: jest.fn().mockResolvedValue({
          id: 1,
          name: "Updated Product",
          price: 150,
        }),
      };

      (Product.findByPk as jest.Mock).mockResolvedValue(mockProduct);

      const response = await request(app)
        .patch("/api/products/1")
        .send({ name: "Updated Product", price: 150 });

      expect(response.status).toBe(200);
      expect(mockProduct.update).toHaveBeenCalled();
      expect(mockProduct.reload).toHaveBeenCalled();
      expect(authenticateJWT).toHaveBeenCalled();
      expect(isAdmin).toHaveBeenCalled();
    });

    it("should return 404 if product not found", async () => {
      (Product.findByPk as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .patch("/api/products/999")
        .send({ name: "Updated Product" });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Product not found" });
    });

    it("should handle errors", async () => {
      (Product.findByPk as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app)
        .patch("/api/products/1")
        .send({ name: "Updated Product" });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Failed to update product" });
    });
  });

  describe("DELETE /api/products/:id", () => {
    it("should delete a product", async () => {
      const mockProduct = {
        id: 1,
        name: "Product to Delete",
        destroy: jest.fn().mockResolvedValue(true),
      };

      (Product.findByPk as jest.Mock).mockResolvedValue(mockProduct);

      const response = await request(app).delete("/api/products/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Product deleted successfully",
      });
      expect(mockProduct.destroy).toHaveBeenCalled();
      expect(authenticateJWT).toHaveBeenCalled();
      expect(isAdmin).toHaveBeenCalled();
    });

    it("should return 404 if product not found", async () => {
      (Product.findByPk as jest.Mock).mockResolvedValue(null);

      const response = await request(app).delete("/api/products/999");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Product not found" });
    });

    it("should handle errors", async () => {
      (Product.findByPk as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).delete("/api/products/1");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Failed to delete product" });
    });
  });
});
