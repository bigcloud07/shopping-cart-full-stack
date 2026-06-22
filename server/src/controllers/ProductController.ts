import { Request, Response } from "express";
import { ProductValidationError } from "../errors/productError.js";
import ProductService from "../service/ProductService.js";
import ServiceError from "../service/ServiceError.js";

export default class ProductController {
  constructor(private readonly productService: ProductService) {}

  getProductAll = async (req: Request, res: Response) => {
    try {
      const products = await this.productService.getProducts();
      res.status(200).json({
        result: "success",
        data: {
          products,
        },
      });
    } catch (error) {
      res.status(500).json();
    }
  };

  getProduct = async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const product = await this.productService.getProduct(String(productId));
      res.status(200).json({
        result: "success",
        data: product,
      });
    } catch (error) {
      if (error instanceof ServiceError) {
        return res.status(error.status).json({
          result: "error",
          message: error.message,
        });
      }

      res.status(500).json({
        result: "error",
        message: "서버 내부 오류가 발생했습니다.",
      });
    }
  };

  addProduct = async (req: Request, res: Response) => {
    try {
      await this.productService.addProduct(req.body);
      res.status(201).json();
    } catch (error) {
      if (error instanceof ServiceError) {
        return res.status(error.status).json({
          result: "error",
          message: error.message,
        });
      }

      if (error instanceof ProductValidationError) {
        return res.status(error.status).json({
          result: "error",
          message: error.message,
          errors: error.errors,
        });
      }
      res.status(500).json();
    }
  };

  removeProduct = async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      await this.productService.removeProduct(String(productId));
      res.status(204).json();
    } catch (error) {
      res.status(500).json();
    }
  };
}
