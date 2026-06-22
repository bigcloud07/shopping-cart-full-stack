import { Request, Response } from "express";
import ProductService from "../service/ProductService.js";
import { sendErrorResponse } from "./httpResponse.js";

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
      sendErrorResponse(res, error);
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
      sendErrorResponse(res, error);
    }
  };

  addProduct = async (req: Request, res: Response) => {
    try {
      await this.productService.addProduct(req.body);
      res.status(201).json();
    } catch (error) {
      sendErrorResponse(res, error);
    }
  };

  removeProduct = async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      await this.productService.removeProduct(String(productId));
      res.status(204).json();
    } catch (error) {
      sendErrorResponse(res, error);
    }
  };
}
