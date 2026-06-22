import type { SupabaseClient } from "@supabase/supabase-js";
import SupabaseCartRepository, {
  type CartRepository,
} from "./CartRepository.js";
import SupabaseProductRepository, {
  type ProductRepository,
} from "./ProductRepository.js";
import SupabaseCouponRepository, {
  type CouponRepository,
} from "./CouponRepository.js";

export interface Repositories {
  productRepository: ProductRepository;
  cartRepository: CartRepository;
  couponRepository: CouponRepository;
}

export function createSupabaseRepositories(
  supabase: SupabaseClient,
): Repositories {
  return {
    productRepository: new SupabaseProductRepository(supabase),
    cartRepository: new SupabaseCartRepository(supabase),
    couponRepository: new SupabaseCouponRepository(supabase),
  };
}
