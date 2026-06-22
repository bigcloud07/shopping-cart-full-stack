import type { CartItemResponse } from "../models/Cart.js";
import type { CartRepository } from "../Repository/CartRepository.js";
import type { ProductRepository } from "../Repository/ProductRepository.js";
import ServiceError from "./ServiceError.js";

export default class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async getAllItems(): Promise<CartItemResponse[]> {
    const cartItems = await this.cartRepository.findAll();
    const productIds = cartItems
      .filter(item => item.productData === undefined)
      .map(item => item.productId);
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

  async updateQuantity(productId: string, quantity: unknown) {
    const id = Number(productId);
    const parsedQuantity = Number(quantity);

    if (
      Number.isNaN(parsedQuantity) ||
      Number.isNaN(id) ||
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 1 ||
      parsedQuantity > 99
    ) {
      throw new ServiceError(400, "수량이 유효하지 않습니다.");
    }

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
    const id = Number(productId);

    if (!id || Number.isNaN(id) || id < 1) {
      return;
    }

    await this.cartRepository.deleteByProductId(id);
  }
}
