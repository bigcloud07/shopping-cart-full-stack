import type { Response } from "express";
import { ProductValidationError } from "../errors/productError.js";
import ServiceError from "../service/ServiceError.js";

const INTERNAL_SERVER_ERROR_MESSAGE = "서버 내부 오류가 발생했습니다.";

export function sendErrorResponse(res: Response, error: unknown) {
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

  return res.status(500).json({
    result: "error",
    message: INTERNAL_SERVER_ERROR_MESSAGE,
  });
}
