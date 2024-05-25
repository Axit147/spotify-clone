import { getURL } from "@/libs/helpers";
import { stripe } from "@/libs/stripe";
import { createOrRetrieveCustomer } from "@/libs/supabseAdmin";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { price, quantity = 1, metadata = {} } = await req.json();

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const customer = await createOrRetrieveCustomer({
      uuid: user?.id || "",
      email: user?.email || "",
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      billing_address_collection: "required",
      customer,
      line_items: [
        {
          price: price.id,
          quantity,
        },
      ],
      mode: "subscription",
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 30,
        metadata,
      },
      success_url: `${getURL()}/account`,
      cancel_url: `${getURL()}`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.log(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
