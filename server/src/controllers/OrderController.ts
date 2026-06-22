import { Request, Response } from "express";
import OrderService from "../service/OrderService.js";
import { sendErrorResponse } from "./httpResponse.js";

export default class OrderController {
  constructor(private readonly orderService: OrderService) {}

  createOrder = async (req: Request, res: Response) => {
    try {
      const order = await this.orderService.createOrder(req.body);

      res.status(201).json({
        result: "success",
        data: order,
      });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  };

  getCoupons = async (req: Request, res: Response) => {
    try {
      const coupons = await this.orderService.getCoupons(req.query);

      res.status(200).json({
        result: "success",
        data: coupons,
      });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  };

  applyCoupons = async (req: Request, res: Response) => {
    try {
      const order = await this.orderService.applyCoupons(req.body);

      res.status(200).json({
        result: "success",
        data: order,
      });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  };
}
