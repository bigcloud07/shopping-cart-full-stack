import express from "express";
import cors from "cors";
import ProductController from "./controllers/ProductController.js";
import {
  DBInterface,
  InMemoryCartRepository,
  InMemoryCouponRepository,
  InMemoryProductRepository,
} from "./db/db.js";
import CartController from "./controllers/CartController.js";
import ProductService from "./service/ProductService.js";
import CartService from "./service/CartService.js";
import OrderService from "./service/OrderService.js";
import OrderController from "./controllers/OrderController.js";
import type { Repositories } from "./Repository/createRepositories.js";

export interface AppServices {
  productService: ProductService;
  cartService: CartService;
  orderService: OrderService;
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
    orderService: new OrderService(
      repositories.cartRepository,
      repositories.productRepository,
      repositories.couponRepository,
    ),
  };
}

export function createServicesFromDb(db: DBInterface): AppServices {
  return createServices({
    productRepository: new InMemoryProductRepository(db),
    cartRepository: new InMemoryCartRepository(db),
    couponRepository: new InMemoryCouponRepository(),
  });
}

export function createApp(servicesOrDb: AppServices | DBInterface) {
  const services =
    "PRODUCT_TABLE" in servicesOrDb
      ? createServicesFromDb(servicesOrDb)
      : servicesOrDb;
  const productController = new ProductController(services.productService);
  const cartController = new CartController(services.cartService);
  const orderController = new OrderController(services.orderService);

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
    cartController.updateQuantity(req, res);
  });
  app.delete("/cart/:productId", (req, res) => {
    cartController.deleteItem(req, res);
  });
  app.post("/order", (req, res) => {
    orderController.createOrder(req, res);
  });
  app.get("/coupon", (req, res) => {
    orderController.getCoupons(req, res);
  });
  app.patch("/order/coupon", (req, res) => {
    orderController.applyCoupons(req, res);
  });

  return app;
}
