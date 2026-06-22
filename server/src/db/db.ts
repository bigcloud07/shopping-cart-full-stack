import type { ProductData, ProductRecord } from "../models/Product.js";
import type { CartItem, CartRecord } from "../models/Cart.js";
import type { ProductRepository } from "../Repository/ProductRepository.js";
import type { CartRepository } from "../Repository/CartRepository.js";
import type { CouponRepository } from "../Repository/CouponRepository.js";
import { DEFAULT_COUPONS, type CouponCode } from "../models/Coupon.js";

export class ProductDB {
  #table = new Map<number, ProductData>();
  #nextId = 1;

  insert(data: ProductData): number {
    const id = this.#nextId++;
    this.#table.set(id, data);
    return id;
  }

  set(id: number, data: ProductData): void {
    this.#table.set(id, data);
    if (id >= this.#nextId) this.#nextId = id + 1;
  }

  get(id: number) {
    return this.#table.get(id);
  }
  has(id: number) {
    return this.#table.has(id);
  }
  delete(id: number) {
    this.#table.delete(id);
  }
  entries() {
    return this.#table.entries();
  }
  get size() {
    return this.#table.size;
  }
  clear() {
    this.#table.clear();
    this.#nextId = 1;
  }
}

export interface DBInterface {
  PRODUCT_TABLE: ProductDB;
  CART_TABLE: Map<number, CartItem>;
}

export class InMemoryProductRepository implements ProductRepository {
  constructor(private readonly db: DBInterface) {}

  async findAll(): Promise<ProductRecord[]> {
    return Array.from(this.db.PRODUCT_TABLE.entries()).map(([id, productData]) => ({
      id,
      ...productData,
    }));
  }

  async findById(id: number): Promise<ProductRecord | null> {
    const product = this.db.PRODUCT_TABLE.get(id);
    return product ? { id, ...product } : null;
  }

  async findByIds(ids: number[]): Promise<ProductRecord[]> {
    const idSet = new Set(ids);
    return Array.from(this.db.PRODUCT_TABLE.entries())
      .filter(([id]) => idSet.has(id))
      .map(([id, productData]) => ({
        id,
        ...productData,
      }));
  }

  async create(product: ProductData): Promise<ProductRecord> {
    const id = this.db.PRODUCT_TABLE.insert(product);
    return {
      id,
      ...product,
    };
  }

  async deleteById(id: number): Promise<void> {
    this.db.PRODUCT_TABLE.delete(id);
  }
}

export class InMemoryCartRepository implements CartRepository {
  constructor(private readonly db: DBInterface) {}

  async findAll(): Promise<CartRecord[]> {
    return Array.from(this.db.CART_TABLE.entries()).map(([productId, cartItem]) => ({
      productId,
      ...cartItem,
    }));
  }

  async findByProductId(productId: number): Promise<CartRecord | null> {
    const cartItem = this.db.CART_TABLE.get(productId);
    return cartItem ? { productId, ...cartItem } : null;
  }

  async updateQuantity(productId: number, quantity: number): Promise<void> {
    const cartItem = this.db.CART_TABLE.get(productId);
    if (!cartItem) return;

    this.db.CART_TABLE.set(productId, {
      ...cartItem,
      quantity,
    });
  }

  async deleteByProductId(productId: number): Promise<void> {
    this.db.CART_TABLE.delete(productId);
  }
}

export class InMemoryCouponRepository implements CouponRepository {
  async findAll() {
    return DEFAULT_COUPONS.map(coupon => ({ ...coupon }));
  }

  async findByCodes(couponCodes: CouponCode[]) {
    const codeSet = new Set(couponCodes);
    return DEFAULT_COUPONS.filter(coupon => codeSet.has(coupon.code)).map(
      coupon => ({ ...coupon }),
    );
  }
}

export function createInMemoryDb(): DBInterface {
  return {
    PRODUCT_TABLE: new ProductDB(),
    CART_TABLE: new Map<number, CartItem>(),
  };
}
