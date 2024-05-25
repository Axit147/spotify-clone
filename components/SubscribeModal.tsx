"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";
import { Price, ProductWithPrice } from "@/types";
import Button from "./Button";
import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { toast } from "./ui/use-toast";
import { postData } from "@/libs/helpers";
import { getStripe } from "@/libs/stripeClient";
import useSubscribeModal from "@/hooks/useSubscribeModal";
import Box from "./Box";
import PropagateLoader from "react-spinners/PropagateLoader";

interface SubscribeModalProps {
  products: ProductWithPrice[] | null;
  isLoading: boolean;
}

const formatePrice = (price: Price) => {
  const priceString = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency,
    minimumFractionDigits: 0,
  }).format((price?.unit_amount || 0) / 100);

  return priceString;
};

const SubscribeModal: React.FC<SubscribeModalProps> = ({
  products,
  isLoading,
}) => {
  let content = <div className="text-center">No products available</div>;

  const { user, isLoading: isUserLoading, subscription } = useUser();
  const [priceIdLoading, setPriceIdLoading] = useState<string>();

  const subscribeModal = useSubscribeModal();

  const handleCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);

    if (!user) {
      setPriceIdLoading(undefined);
      return toast({
        variant: "destructive",
        title: "Must be logged in",
      });
    }

    if (subscription) {
      setPriceIdLoading(undefined);
      return toast({
        title: "Already subscribed",
      });
    }

    try {
      const { sessionId } = await postData({
        url: "/api/create-checkout-session",
        data: { price },
      });
      console.log(sessionId);
      const stripe = await getStripe();
      stripe?.redirectToCheckout({ sessionId });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: error.message,
      });
    } finally {
      setPriceIdLoading(undefined);
    }
  };

  if (products?.length) {
    content = (
      <div>
        {products?.map((product: any) => {
          if (!product.prices?.length) {
            return <div key={product.id}>No prices available</div>;
          }

          return product?.prices?.map((price: any) => (
            <Button
              key={price.id}
              onClick={() => handleCheckout(price)}
              disabled={isUserLoading || price.id === priceIdLoading}
              className="mb-4"
            >
              {`Subscribe for ${formatePrice(price)} a ${price.interval}`}
            </Button>
          ));
        })}
      </div>
    );
  }

  if (subscription) {
    content = <div className="text-center">Already Subscribed</div>;
  }

  const onChange = (open: boolean) => {
    if (!open) {
      subscribeModal.onClose();
    }
    return;
  };

  return (
    <Dialog open={subscribeModal.isOpen} onOpenChange={onChange}>
      <DialogContent className="bg-neutral-900">
        <DialogTitle>Only for premium users</DialogTitle>
        <DialogDescription>
          Listen to music with Spotify Premium
        </DialogDescription>
        {isLoading ? (
          <Box className="flex items-center justify-center m-6 mx-auto">
            <PropagateLoader color="#22c55e" size={15} />
          </Box>
        ) : (
          content
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubscribeModal;
