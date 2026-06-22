import type { CartItemResponse, CartRecord } from "../models/Cart.js";
import type { CartRepository } from "../Repository/CartRepository.js";
import type { ProductRepository } from "../Repository/ProductRepository.js";
import ServiceError from "./ServiceError.js";

const MIN_CART_QUANTITY = 1;
const MAX_CART_QUANTITY = 99;

export default class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async getAllItems(): Promise<CartItemResponse[]> {
    const cartItems = await this.cartRepository.findAll();
    const productIds = this.#getProductIdsToLoad(cartItems);
    const products = await this.productRepository.findByIds(productIds);
    const productById = new Map(products.map(product => [product.id, product]));

    return cartItems
      .sort((a, b) => a.productId - b.productId)
      .map(cartItem => {
        const productData =
          cartItem.productData ?? productById.get(cartItem.productId);

        if (!productData) {
          throw new ServiceError(404, "해당하는 상품이 없습니다.");
        }

        return {
          productId: cartItem.productId,
          productName: productData.name,
          productImg: productData.imgUrl,
          productPrice: productData.price,
          quantity: cartItem.quantity,
        };
      });
  }

  async updateQuantity(
    productId: string,
    quantity: unknown,
  ): Promise<{ productId: number; quantity: number }> {
    const id = this.#parseProductId(productId);
    const parsedQuantity = this.#parseQuantity(quantity);

    const cartItem = await this.cartRepository.findByProductId(id);
    if (!cartItem) {
      throw new ServiceError(404, "해당하는 장바구니 항목이 없습니다.");
    }

    await this.cartRepository.updateQuantity(id, parsedQuantity);

    return {
      productId: id,
      quantity: parsedQuantity,
    };
  }

  async deleteItem(productId: string): Promise<void> {
    const id = this.#parseOptionalProductId(productId);

    if (id === null) {
      return;
    }

    await this.cartRepository.deleteByProductId(id);
  }

  #getProductIdsToLoad(cartItems: CartRecord[]): number[] {
    return [
      ...new Set(
        cartItems
          .filter(item => item.productData === undefined)
          .map(item => item.productId),
      ),
    ];
  }

  #parseProductId(productId: string): number {
    const id = Number(productId);

    if (!Number.isInteger(id) || id < 1) {
      throw new ServiceError(400, "수량이 유효하지 않습니다.");
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

  #parseQuantity(quantity: unknown): number {
    const parsedQuantity = Number(quantity);

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < MIN_CART_QUANTITY ||
      parsedQuantity > MAX_CART_QUANTITY
    ) {
      throw new ServiceError(400, "수량이 유효하지 않습니다.");
    }

    return parsedQuantity;
  }
}
