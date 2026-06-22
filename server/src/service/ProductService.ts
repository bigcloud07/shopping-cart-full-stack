import Product, {
  type ProductData,
  type ProductRecord,
} from "../models/Product.js";
import type { ProductRepository } from "../Repository/ProductRepository.js";
import type { CartRepository } from "../Repository/CartRepository.js";
import ServiceError from "./ServiceError.js";

export default class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly cartRepository: CartRepository,
  ) {}

  async getProducts(): Promise<ProductRecord[]> {
    const products = await this.productRepository.findAll();
    return products.sort((a, b) => a.id - b.id);
  }

  async getProduct(productId: string): Promise<ProductRecord> {
    const id = this.#parseProductId(productId);
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new ServiceError(404, "해당하는 상품이 없습니다.");
    }

    return product;
  }

  async addProduct(input: Partial<ProductData>): Promise<ProductRecord> {
    const { name, price, imgUrl } = input;

    if (name === undefined || price === undefined) {
      throw new ServiceError(400, "형식이 비었습니다");
    }

    const product = new Product({ name, price, imgUrl });
    return this.productRepository.create(product.getProduct());
  }

  async removeProduct(productId: string): Promise<void> {
    const id = this.#parseOptionalProductId(productId);

    if (id === null) {
      return;
    }

    await this.cartRepository.deleteByProductId(id);
    await this.productRepository.deleteById(id);
  }

  #parseProductId(productId: string): number {
    const id = Number(productId);

    if (!Number.isInteger(id) || id < 1) {
      throw new ServiceError(
        400,
        "해당하는 상품의 id 형식이 유효하지 않습니다.",
      );
    }

    return id;
  }

  #parseOptionalProductId(productId: string): number | null {
    const id = Number(productId);

    if (!Number.isInteger(id) || id < 1) {
      return null;
    }

    return id;
  }
}
