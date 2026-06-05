import type { ProductData } from "../models/Product.js";
import type { CartItem } from "../controllers/CartController.js";

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
    name: "상품 B",
    price: 25000,
    imgUrl: "https://picsum.photos/200/200?random=2",
  },
  quantity: 1,
});
DB.CART_TABLE.set(3, {
  productData: {
    name: "상품 B",
    price: 25000,
    imgUrl: "https://picsum.photos/200/200?random=3",
  },
  quantity: 1,
});
DB.CART_TABLE.set(4, {
  productData: {
    name: "상품 B",
    price: 25000,
    imgUrl: "https://picsum.photos/200/200?random=4",
  },
  quantity: 1,
});
