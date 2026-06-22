import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BogoCoupon,
  CouponCode,
  CouponData,
  FixedCoupon,
  FreeShippingCoupon,
  PercentageCoupon,
} from "../models/Coupon.js";

export interface CouponRepository {
  findAll(): Promise<CouponData[]>;
  findByCodes(couponCodes: CouponCode[]): Promise<CouponData[]>;
}

type CouponRow = {
  id: number;
  code: CouponCode;
  description: string;
  expirationDate?: string;
  expiration_date?: string;
  discountType?: CouponData["discountType"];
  discount_type?: CouponData["discountType"];
  discountAmount?: number;
  discount_amount?: number;
  minimumAmount?: number;
  minimum_amount?: number;
  minimumAccount?: number;
  minimum_account?: number;
  buyQuantity?: number;
  buy_quantity?: number;
  getQuantity?: number;
  get_quantity?: number;
  discountRate?: number;
  discount_rate?: number;
  availableTime?: { start: string; end: string };
  available_time?: { start: string; end: string };
};

export default class SupabaseCouponRepository implements CouponRepository {
  #tableName: string;

  constructor(
    private readonly supabase: SupabaseClient,
    tableName = process.env.SUPABASE_COUPON_TABLE ?? "Coupon",
  ) {
    this.#tableName = tableName;
  }

  async findAll(): Promise<CouponData[]> {
    const { data, error } = await this.supabase
      .from(this.#tableName)
      .select("*");

    if (error) throw new Error(error.message);
    return (data ?? []).map(this.#toCouponData);
  }

  async findByCodes(couponCodes: CouponCode[]): Promise<CouponData[]> {
    if (couponCodes.length === 0) return [];

    const { data, error } = await this.supabase
      .from(this.#tableName)
      .select("*")
      .in("code", couponCodes);

    if (error) throw new Error(error.message);
    return (data ?? []).map(this.#toCouponData);
  }

  #toCouponData(row: CouponRow): CouponData {
    const discountType = row.discountType ?? row.discount_type;
    const baseCoupon = {
      id: row.id,
      code: row.code,
      description: row.description,
      expirationDate: row.expirationDate ?? row.expiration_date ?? "",
    };

    if (discountType === "fixed") {
      return {
        ...baseCoupon,
        discountType,
        discountAmount: row.discountAmount ?? row.discount_amount ?? 0,
        minimumAmount:
          row.minimumAmount ??
          row.minimum_amount ??
          row.minimumAccount ??
          row.minimum_account ??
          0,
      } satisfies FixedCoupon;
    }

    if (discountType === "bogo") {
      return {
        ...baseCoupon,
        discountType,
        buyQuantity: row.buyQuantity ?? row.buy_quantity ?? 0,
        getQuantity: row.getQuantity ?? row.get_quantity ?? 0,
      } satisfies BogoCoupon;
    }

    if (discountType === "freeShipping") {
      return {
        ...baseCoupon,
        discountType,
        minimumAmount:
          row.minimumAmount ??
          row.minimum_amount ??
          row.minimumAccount ??
          row.minimum_account ??
          0,
      } satisfies FreeShippingCoupon;
    }

    if (discountType === "percentage") {
      return {
        ...baseCoupon,
        discountType,
        discountRate: row.discountRate ?? row.discount_rate ?? 0,
        availableTime: row.availableTime ??
          row.available_time ?? { start: "00:00", end: "00:00" },
      } satisfies PercentageCoupon;
    }

    throw new Error(`Unsupported coupon type: ${String(discountType)}`);
  }
}
