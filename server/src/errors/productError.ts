export interface ProductError {
  field: string;
  code: string;
  message: string;
}

export interface ProductErrors {
  name: ProductError;
  price: ProductError;
  imgUrl: ProductError;
}

export class ProductValidationError extends Error {
  status = 400;
  errors: ProductError[];

  constructor(errors: ProductError[]) {
    super("요청 값이 올바르지 않습니다.");
    this.errors = errors.map((e) => ({ ...e }));
  }
}
export const productErrors: ProductErrors = {
  name: {
    field: "name",
    code: "INVALID_PRODUCT_NAME",
    message: "상품 이름이 유효하지 않습니다.",
  },
  price: {
    field: "price",
    code: "INVALID_PRODUCT_PRICE",
    message: "상품 가격이 유효하지 않습니다.",
  },
  imgUrl: {
    field: "imgUrl",
    code: "PRODUCT_IMAGE_URL_INVALID",
    message: "유효한 이미지 URL 형식이 아닙니다.",
  },
};
