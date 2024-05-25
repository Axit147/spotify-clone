import { User } from "@supabase/supabase-js";
import { Subscription, UserDetails } from "@/types";
import { create } from "zustand";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

type USerContextType = {
  // accessToken: string | null;
  user: User | null;
  userDetails: UserDetails | null;
  isLoading: boolean;
  subscription: Subscription | null;
  fetchUserData: () => void;
  resetUserData: () => void;
};

const useUser = create<USerContextType>((set) => ({
  // accessToken: null,
  user: null,
  userDetails: null,
  isLoading: false,
  subscription: null,
  fetchUserData: async () => {
    set({ isLoading: true });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    // const {
    //   data: { session },
    // } = await supabase.auth.getSession();
    const userDetails = await supabase.from("users").select("*").single();
    const subscription = await supabase
      .from("subscriptions")
      .select("*, prices(*, products(*))")
      .in("status", ["trialing", "active"])
      .single();

    set({ isLoading: false });

    return set({
      user: user,
      userDetails: userDetails.data,
      subscription: subscription.data,
      // accessToken: session?.access_token,
    });
  },
  resetUserData: () =>
    set({
      user: null,
      userDetails: null,
      isLoading: false,
      subscription: null,
      // accessToken: null,
    }),
}));

export { useUser };
