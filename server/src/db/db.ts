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

  get(id: number) { return this.#table.get(id); }
  has(id: number) { return this.#table.has(id); }
  delete(id: number) { this.#table.delete(id); }
  entries() { return this.#table.entries(); }
  get size() { return this.#table.size; }
  clear() { this.#table.clear(); this.#nextId = 1; }
}

export interface DBInterface {
  PRODUCT_TABLE: ProductDB;
  CART_TABLE: Map<number, CartItem>;
}

export const DB: DBInterface = {
  PRODUCT_TABLE: new ProductDB(),
  CART_TABLE: new Map<number, CartItem>(),
};
