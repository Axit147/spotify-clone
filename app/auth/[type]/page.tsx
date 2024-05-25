"use client";

import Button from "@/components/Button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/utils/supabase/client";
import { AuthError } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";

export default function Form({
  params,
}: {
  params: { type: "sign_in" | "sign_up" };
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const { toast } = useToast();
  const supabase = createClient();
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<FieldValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (values) => {
    setIsLoading(true);
    const data = {
      email: values.email,
      password: values.password,
    };

    if (params.type === "sign_in") {
      const { error: signInError } = await supabase.auth.signInWithPassword(
        data
      );
      if (signInError) {
        setError(signInError);
        setIsLoading(false);
        return;
      }
    } else {
      const { error: signUpError } = await supabase.auth.signUp(data);
      if (signUpError) {
        setError(signUpError);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(false);
    toast({
      title: "Authorized successfully",
      duration: 3000,
    });
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex h-full w-full justify-center items-center bg-background">
      <div className="w-full h-auto max-w-[400px] bg-neutral-900 p-6 rounded-md">
        <div className="mb-5 text-center text-xl font-bold">
          {params.type === "sign_in" ? "Welcome Back" : "Register"}
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-y-4"
        >
          <Input
            id="email"
            disabled={isLoading}
            {...register("email", { required: true })}
            placeholder="E-mail"
          />
          <Input
            id="password"
            type="password"
            disabled={isLoading}
            {...register("password", { required: true })}
            placeholder="Password"
          />
          {error ? (
            <div className="p-3 bg-red-600/15 border border-red-700 rounded-md text-center">
              {error.message}
            </div>
          ) : null}
          <Button disabled={isLoading} type="submit">
            {params.type === "sign_up"
              ? isLoading
                ? "Signing up..."
                : "Sign up"
              : isLoading
              ? "Loging in..."
              : "Log in"}
          </Button>
        </form>
        <div
          onClick={() => {
            if (params.type === "sign_up") {
              router.replace("/auth/sign_in");
            } else {
              router.replace("/auth/sign_up");
            }
          }}
          className="mt-3 text-center font-extralight text-sm underline underline-offset-2 hover:font-light transition cursor-pointer"
        >
          {params.type === "sign_up"
            ? "Already have an account? Sign in"
            : "Don't have an account? Sign up"}
        </div>
      </div>
    </div>
  );
}
