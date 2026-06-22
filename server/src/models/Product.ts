import {
  ProductError,
  productErrors,
  ProductValidationError,
} from "../errors/productError.js";

export interface ProductData {
  name: string;
  price: number;
  imgUrl?: string;
}

export interface ProductRecord extends ProductData {
  id: number;
}

export default class Product {
  static MAX_NAME_LENGTH = 100;

  #name: string;
  #price: number;
  #imgUrl?: string;

  constructor({
    name,
    price,
    imgUrl,
  }: {
    name: string;
    price: number;
    imgUrl?: string;
  }) {
    this.#validate({ name, price, imgUrl });

    this.#name = name;
    this.#imgUrl = imgUrl;
    this.#price = price;
  }

  #validate = ({
    name,
    price,
    imgUrl,
  }: {
    name: string;
    price: number;
    imgUrl?: string;
  }) => {
    const errors: ProductError[] = [];
    if (name.length === 0 || Product.MAX_NAME_LENGTH < name.length) {
      errors.push(productErrors.name);
    }
    if (price <= 0) {
      errors.push(productErrors.price);
    }
    if (
      imgUrl &&
      !imgUrl.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/)
    ) {
      errors.push(productErrors.imgUrl);
    }

    if (errors.length !== 0) {
      throw new ProductValidationError(errors);
    }
  };

  getProduct() {
    return {
      name: this.#name,
      price: this.#price,
      imgUrl: this.#imgUrl ?? "https://imgstore.com/image.png",
    };
  }
}
