import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductData, ProductRecord } from "../models/Product.js";

export interface ProductRepository {
  findAll(): Promise<ProductRecord[]>;
  findById(id: number): Promise<ProductRecord | null>;
  findByIds(ids: number[]): Promise<ProductRecord[]>;
  create(product: ProductData): Promise<ProductRecord>;
  deleteById(id: number): Promise<void>;
}

type ProductRow = {
  id: number;
  name: string;
  price: number;
  imgUrl?: string | null;
  img_url?: string | null;
};

export default class SupabaseProductRepository implements ProductRepository {
  #tableName: string;

  constructor(
    private readonly supabase: SupabaseClient,
    tableName = process.env.SUPABASE_PRODUCT_TABLE ?? "Product",
  ) {
    this.#tableName = tableName;
  }

  async findAll(): Promise<ProductRecord[]> {
    const { data, error } = await this.supabase
      .from(this.#tableName)
      .select("*");
    if (error) throw new Error(error.message);

    return (data ?? []).map(this.#toProductRecord);
  }

  async findById(id: number): Promise<ProductRecord | null> {
    const { data, error } = await this.supabase
      .from(this.#tableName)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? this.#toProductRecord(data) : null;
  }

  async findByIds(ids: number[]): Promise<ProductRecord[]> {
    if (ids.length === 0) return [];

    const { data, error } = await this.supabase
      .from(this.#tableName)
      .select("*")
      .in("id", ids);

    if (error) throw new Error(error.message);
    return (data ?? []).map(this.#toProductRecord);
  }

  async create(product: ProductData): Promise<ProductRecord> {
    const { data, error } = await this.supabase
      .from(this.#tableName)
      .insert(product)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return this.#toProductRecord(data);
  }

  async deleteById(id: number): Promise<void> {
    const { error } = await this.supabase
      .from(this.#tableName)
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  #toProductRecord(row: ProductRow): ProductRecord {
    return {
      id: row.id,
      name: row.name,
      price: row.price,
      imgUrl: row.imgUrl ?? row.img_url ?? undefined,
    };
  }
}
