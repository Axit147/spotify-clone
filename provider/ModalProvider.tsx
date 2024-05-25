"use client";

import getActiveProductsWithPrices from "@/actions/getActiveProductsWithPrices";
import SubscribeModal from "@/components/SubscribeModal";
import UploadModal from "@/components/UploadModal";
import { ProductWithPrice } from "@/types";
import { useEffect, useState } from "react";

const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<ProductWithPrice[] | null>(null);

  const getProducts = async () => {
    setIsLoading(true);
    const products = await getActiveProductsWithPrices();
    setProducts(products);
    setIsLoading(false);
  };

  useEffect(() => {
    setIsMounted(true);
    getProducts();
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div>
      <UploadModal />
      <SubscribeModal products={products} isLoading={isLoading} />
    </div>
  );
};

export default ModalProvider;
