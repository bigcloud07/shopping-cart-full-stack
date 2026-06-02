import express from "express";
import cors from "cors";
import ProductController from "./controllers/ProductController.js";
import { DBInterface } from "./db/db.js";
import CartController from "./controllers/CartController.js";

export function createApp(db: DBInterface) {
  const productController = new ProductController(db);
  const cartController = new CartController(db);

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/products", (req, res) => {
    productController.getProductAll(req, res);
  });
  app.get("/products/:productId", (req, res) => {
    productController.getProduct(req, res);
  });
  app.post("/products", (req, res) => {
    productController.addProduct(req, res);
  });
  app.delete("/products/:productId", (req, res) => {
    productController.removeProduct(req, res);
  });
  app.get("/cart", (req, res) => {
    cartController.getAllItems(req, res);
  });
  app.patch("/cart/:productId", (req, res) => {
    cartController.updateQuantitiy(req, res);
  });
  app.delete("/cart/:productId", (req, res) => {
    cartController.deleteItem(req, res);
  });

  return app;
}
