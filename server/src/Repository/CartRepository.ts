import type { SupabaseClient } from "@supabase/supabase-js";
import type { CartRecord } from "../models/Cart.js";

export interface CartRepository {
  findAll(): Promise<CartRecord[]>;
  findByProductId(productId: number): Promise<CartRecord | null>;
  updateQuantity(productId: number, quantity: number): Promise<void>;
  deleteByProductId(productId: number): Promise<void>;
}

type CartRow = {
  productId?: number;
  product_id?: number;
  quantity: number;
};

export default class SupabaseCartRepository implements CartRepository {
  #tableName: string;
  #productIdColumn: string;

  constructor(
    private readonly supabase: SupabaseClient,
    tableName = process.env.SUPABASE_CART_TABLE ?? "Cart",
    productIdColumn = process.env.SUPABASE_CART_PRODUCT_ID_COLUMN ??
      "productId",
  ) {
    this.#tableName = tableName;
    this.#productIdColumn = productIdColumn;
  }

  async findAll(): Promise<CartRecord[]> {
    const { data, error } = await this.supabase
      .from(this.#tableName)
      .select("*");
    if (error) throw new Error(error.message);

    return (data ?? []).map(this.#toCartRecord);
  }

  async findByProductId(productId: number): Promise<CartRecord | null> {
    const { data, error } = await this.supabase
      .from(this.#tableName)
      .select("*")
      .eq(this.#productIdColumn, productId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? this.#toCartRecord(data) : null;
  }

  async updateQuantity(productId: number, quantity: number): Promise<void> {
    const { error } = await this.supabase
      .from(this.#tableName)
      .update({ quantity })
      .eq(this.#productIdColumn, productId);

    if (error) throw new Error(error.message);
  }

  async deleteByProductId(productId: number): Promise<void> {
    const { error } = await this.supabase
      .from(this.#tableName)
      .delete()
      .eq(this.#productIdColumn, productId);

    if (error) throw new Error(error.message);
  }

  #toCartRecord(row: CartRow): CartRecord {
    const productId = row.productId ?? row.product_id;

    if (productId === undefined) {
      throw new Error("Cart row does not include a product id.");
    }

    return {
      productId,
      quantity: row.quantity,
    };
  }
}
