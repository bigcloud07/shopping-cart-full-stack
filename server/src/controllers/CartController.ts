import { Request, Response } from "express";
import CartService from "../service/CartService.js";
import ServiceError from "../service/ServiceError.js";

export default class CartController {
  constructor(private readonly cartService: CartService) {}

  getAllItems = async (req: Request, res: Response) => {
    try {
      const cartItems = await this.cartService.getAllItems();

      res.status(200).json({
        result: "success",
        data: {
          cartItems: cartItems,
        },
      });
    } catch (error) {
      if (error instanceof ServiceError) {
        return res.status(error.status).json({
          result: "error",
          message: error.message,
        });
      }

      res.status(500).json();
    }
  };

  updateQuantitiy = async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;
      const updatedItem = await this.cartService.updateQuantity(
        String(productId),
        quantity,
      );

      res.status(200).json({
        result: "success",
        data: updatedItem,
      });
    } catch (error) {
      if (error instanceof ServiceError) {
        return res.status(error.status).json({
          result: "error",
          message: error.message,
        });
      }

      res.status(500).json();
    }
  };

  deleteItem = async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      await this.cartService.deleteItem(String(productId));
      res.status(204).json();
    } catch (error) {
      res.status(500).json();
    }
  };
}
