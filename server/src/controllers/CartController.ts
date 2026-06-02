import { DBInterface } from "../db/db.js";
import { type ProductData } from "../models/Product.js";
import { Request, Response } from "express";

export interface CartItem {
  productData: ProductData;
  quantity: number;
}

export default class CartController {
  #db;

  constructor(db: DBInterface) {
    this.#db = db;
  }

  getAllItems = (req: Request, res: Response) => {
    try {
      const cartItems = Array.from(this.#db.CART_TABLE.entries()).map(
        ([productId, cartItem]) => {
          const { productData, quantity } = cartItem;
          const { name, price, imgUrl } = productData;

          return {
            productId,
            productName: name,
            productImg: imgUrl,
            productPrice: price,
            quantity: quantity,
          };
        },
      );

      res.status(200).json({
        result: "success",
        data: {
          cartItems: cartItems,
        },
      });
    } catch (error) {
      res.status(500).json();
    }
  };

  updateQuantitiy = (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;
      const id = Number(productId);

      if (Number.isNaN(Number(quantity)) || Number.isNaN(id)) {
        return res.status(400).json({
          result: "error",
          message: "수량이 유효하지 않습니다.",
        });
      }

      if (quantity < 0) {
        return res.status(400).json({
          result: "error",
          message: "수량이 유효하지 않습니다.",
        });
      }

      if (this.#db.CART_TABLE.has(id) === false) {
        return res.status(404).json({
          result: "error",
          message: "해당하는 장바구니 항목이 없습니다.",
        });
      }

      this.#db.CART_TABLE.set(id, quantity);

      res.status(200).json({
        result: "success",
        data: {
          productId: id,
          quantity: quantity,
        },
      });
    } catch (error) {
      res.status(500).json();
    }
  };

  deleteItem = (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const id = Number(productId);

      this.#db.CART_TABLE.delete(id);
      if (!id || Number.isNaN(id)) {
        return res.status(204).json();
      }
      res.status(204).json();
    } catch (error) {
      res.status(500).json();
    }
  };
}
