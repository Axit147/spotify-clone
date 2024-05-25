import { ProductWithPrice } from "@/types";
import { createClient } from "@/utils/supabase/client";

const getActiveProductsWithPrices = async (): Promise<ProductWithPrice[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*, prices(*)")
    .eq("active", true)
    .eq("prices.active", true)
    .order("metadata->index")
    .order("unit_amount", { referencedTable: "prices" });

  if (error) {
    console.log(error);
  }

  return (data as any) || [];
};

export default getActiveProductsWithPrices;
