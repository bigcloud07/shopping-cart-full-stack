import type { ProductData } from "../models/Product.js";
import type { CartItem, CartRecord } from "../models/Cart.js";
import type { ProductRepository } from "../Repository/ProductRepository.js";
import type { CartRepository } from "../Repository/CartRepository.js";

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

  async findAll() {
    return Array.from(this.db.PRODUCT_TABLE.entries()).map(([id, productData]) => ({
      id,
      ...productData,
    }));
  }

  async findById(id: number) {
    const product = this.db.PRODUCT_TABLE.get(id);
    return product ? { id, ...product } : null;
  }

  async findByIds(ids: number[]) {
    const idSet = new Set(ids);
    return Array.from(this.db.PRODUCT_TABLE.entries())
      .filter(([id]) => idSet.has(id))
      .map(([id, productData]) => ({
        id,
        ...productData,
      }));
  }

  async create(product: ProductData) {
    const id = this.db.PRODUCT_TABLE.insert(product);
    return {
      id,
      ...product,
    };
  }

  async deleteById(id: number) {
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

export const DB: DBInterface = {
  PRODUCT_TABLE: new ProductDB(),
  CART_TABLE: new Map<number, CartItem>(),
};

DB.PRODUCT_TABLE.insert({ name: "상품 A", price: 10000 });
DB.PRODUCT_TABLE.insert({
  name: "상품 B",
  price: 25000,
  imgUrl: "https://example.com/b.jpg",
});

DB.CART_TABLE.set(1, {
  productData: {
    name: "상품 A",
    price: 10000,
    imgUrl: "https://picsum.photos/200/200?random=1",
  },
  quantity: 2,
});

DB.CART_TABLE.set(2, {
  productData: {
    name: "상품 B",
    price: 25000,
    imgUrl: "https://picsum.photos/200/200?random=2",
  },
  quantity: 1,
});
DB.CART_TABLE.set(2, {
  productData: {
    name: "상품 C",
    price: 25000,
    imgUrl: "https://picsum.photos/200/200?random=2",
  },
  quantity: 1,
});
DB.CART_TABLE.set(3, {
  productData: {
    name: "상품 D",
    price: 25000,
    imgUrl: "https://picsum.photos/200/200?random=3",
  },
  quantity: 1,
});
DB.CART_TABLE.set(4, {
  productData: {
    name: "상품 E",
    price: 25000,
    imgUrl: "https://picsum.photos/200/200?random=4",
  },
  quantity: 1,
});
