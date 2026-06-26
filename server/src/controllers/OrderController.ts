import { Request, Response } from "express";
import type { CouponCode } from "../models/Coupon.js";
import OrderService from "../service/OrderService.js";
import ServiceError from "../service/ServiceError.js";
import { sendErrorResponse } from "./httpResponse.js";

const MAX_SELECTED_COUPON_COUNT = 2;

export default class OrderController {
  constructor(private readonly orderService: OrderService) {}

  createOrder = async (req: Request, res: Response) => {
    try {
      const productIds = this.#parseProductIds(req.body.productIds);
      const isRemoteArea = this.#parseBoolean(req.body.isRemoteArea);
      const order = await this.orderService.createOrder(
        productIds,
        isRemoteArea,
      );

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
      const productIds = this.#parseProductIds(req.query.productIds);
      const isRemoteArea = this.#parseBoolean(req.query.isRemoteArea);
      const coupons = await this.orderService.getCoupons(
        productIds,
        isRemoteArea,
      );

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
      const productIds = this.#parseProductIds(req.body.productIds);
      const isRemoteArea = this.#parseBoolean(req.body.isRemoteArea);
      const couponCodes = this.#parseCouponCodes(req.body.couponCodes);
      const order = await this.orderService.applyCoupons(
        productIds,
        isRemoteArea,
        couponCodes,
      );

      res.status(200).json({
        result: "success",
        data: order,
      });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  };

  #parseProductIds(productIds: unknown): number[] {
    if (productIds === undefined || productIds === null || productIds === "") {
      return [];
    }

    const values = Array.isArray(productIds)
      ? productIds
      : String(productIds).split(",");
    const parsedProductIds = values.map(value => Number(value));

    if (
      parsedProductIds.some(
        productId => !Number.isInteger(productId) || productId < 1,
      )
    ) {
      throw new ServiceError(400, "상품 id 형식이 유효하지 않습니다.");
    }

    return [...new Set(parsedProductIds)];
  }

  #parseBoolean(value: unknown): boolean {
    if (value === undefined || value === null || value === "") {
      return false;
    }

    if (value === true || value === "true") {
      return true;
    }

    if (value === false || value === "false") {
      return false;
    }

    throw new ServiceError(400, "요청 값이 올바르지 않습니다.");
  }

  #parseCouponCodes(couponCodes: unknown): CouponCode[] {
    if (couponCodes === undefined || couponCodes === null || couponCodes === "") {
      return [];
    }

    const values = Array.isArray(couponCodes)
      ? couponCodes
      : String(couponCodes).split(",");
    const parsedCouponCodes = [
      ...new Set(values.map(value => String(value).trim())),
    ] as CouponCode[];

    if (parsedCouponCodes.length > MAX_SELECTED_COUPON_COUNT) {
      throw new ServiceError(400, "쿠폰은 최대 2개까지 선택할 수 있습니다.");
    }

    return parsedCouponCodes;
  }
}
