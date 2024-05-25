"use client";

import Button from "@/components/Button";
import { toast } from "@/components/ui/use-toast";
import useSubscribeModal from "@/hooks/useSubscribeModal";
import { useUser } from "@/hooks/useUser";
import { postData } from "@/libs/helpers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const AccountContent = () => {
  const router = useRouter();
  const subscribeModal = useSubscribeModal();
  const { isLoading, user, subscription } = useUser();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user && !isLoading) {
      router.replace("/");
    }
  }, [isLoading, user, router]);

  const redirectToustomerPortal = async () => {
    setLoading(true);
    try {
      const { url, error } = await postData({
        url: "/api/create-portal-link",
      });

      window.location.assign(url);
    } catch (error: any) {
      if (error) {
        toast({
          title: error.message,
        });
      }
    }
    setLoading(false);
  };

  return (
    <div className="mb-7 px-6">
      {!subscription && (
        <div className="flex flex-col gap-y-4">
          <p>No active plan.</p>
          <Button onClick={subscribeModal.onOpen} className="w-[300px]">
            Subscribe
          </Button>
        </div>
      )}
      {subscription && (
        <div className="flex flex-col gap-y-4">
          <p>
            You are currently on the{" "}
            <b>{subscription?.prices?.products?.name}</b> plan.
          </p>
          <Button
            disabled={loading || isLoading}
            onClick={redirectToustomerPortal}
            className="w-[300px]"
          >
            Open customer portal
          </Button>
        </div>
      )}
    </div>
  );
};

export default AccountContent;
