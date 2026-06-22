import express from "express";
import cors from "cors";
import ProductController from "./controllers/ProductController.js";
import {
  DBInterface,
  InMemoryCartRepository,
  InMemoryProductRepository,
} from "./db/db.js";
import CartController from "./controllers/CartController.js";
import ProductService from "./service/ProductService.js";
import CartService from "./service/CartService.js";
import type { Repositories } from "./Repository/index.js";

export interface AppServices {
  productService: ProductService;
  cartService: CartService;
}

export function createServices(repositories: Repositories): AppServices {
  return {
    productService: new ProductService(
      repositories.productRepository,
      repositories.cartRepository,
    ),
    cartService: new CartService(
      repositories.cartRepository,
      repositories.productRepository,
    ),
  };
}

export function createServicesFromDb(db: DBInterface): AppServices {
  return createServices({
    productRepository: new InMemoryProductRepository(db),
    cartRepository: new InMemoryCartRepository(db),
  });
}

export function createApp(servicesOrDb: AppServices | DBInterface) {
  const services =
    "PRODUCT_TABLE" in servicesOrDb
      ? createServicesFromDb(servicesOrDb)
      : servicesOrDb;
  const productController = new ProductController(services.productService);
  const cartController = new CartController(services.cartService);

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
