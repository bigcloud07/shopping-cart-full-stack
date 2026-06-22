import type { SupabaseClient } from "@supabase/supabase-js";
import SupabaseCartRepository, {
  type CartRepository,
} from "./CartRepository.js";
import SupabaseProductRepository, {
  type ProductRepository,
} from "./ProductRepository.js";

export interface Repositories {
  productRepository: ProductRepository;
  cartRepository: CartRepository;
}

export function createSupabaseRepositories(
  supabase: SupabaseClient,
): Repositories {
  return {
    productRepository: new SupabaseProductRepository(supabase),
    cartRepository: new SupabaseCartRepository(supabase),
  };
}
