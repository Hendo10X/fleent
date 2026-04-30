"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeSlash } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const signupSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, "Username must be at least 2 characters.")
    .max(32, "Username must be 32 characters or fewer."),
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type SignupValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { username: "", email: "", password: "" },
  });

  async function onSubmit(values: SignupValues) {
    setIsSubmitting(true);

    const { error } = await authClient.signUp.email({
      name: values.username,
      email: values.email,
      password: values.password,
    });

    setIsSubmitting(false);

    if (error) {
      toast.error(signupErrorMessage(error.message));
      return;
    }

    toast.success("Account created.");

    window.setTimeout(() => {
      router.push("/onboarding");
      router.refresh();
    }, 450);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input
            id="username"
            type="text"
            autoComplete="username"
            placeholder="maverick"
            size="lg"
            aria-invalid={Boolean(errors.username)}
            className="bg-white"
            {...register("username")}
          />
          {errors.username ? (
            <FieldError>{errors.username.message}</FieldError>
          ) : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            size="lg"
            aria-invalid={Boolean(errors.email)}
            className="bg-white"
            {...register("email")}
          />
          {errors.email ? <FieldError>{errors.email.message}</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <div className="relative w-full">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              size="lg"
              aria-invalid={Boolean(errors.password)}
              className="bg-white"
              inputClassName="pr-10"
              {...register("password")}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((value) => !value)}
              className="absolute top-1/2 right-2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-fleent-mute transition-colors duration-200 ease-out hover:bg-[#F3F3F3] hover:text-fleent-ink"
            >
              {showPassword ? (
                <EyeSlash size={17} weight="regular" />
              ) : (
                <Eye size={17} weight="regular" />
              )}
            </button>
          </div>
          <FieldDescription>
            Use at least 8 characters. Add a number or symbol for a stronger
            password.
          </FieldDescription>
          {errors.password ? (
            <FieldError>{errors.password.message}</FieldError>
          ) : null}
        </Field>

        <Button
          type="submit"
          size="xl"
          loading={isSubmitting}
          className="mt-2 h-12 rounded-full border-transparent bg-fleent-orange text-white shadow-none hover:bg-fleent-orange/90"
        >
          Create account
          <ArrowRight size={16} weight="bold" />
        </Button>
    </form>
  );
}

function signupErrorMessage(message?: string) {
  const normalized = message?.toLowerCase() ?? "";

  if (normalized.includes("already") || normalized.includes("unique")) {
    return "An account with this email already exists.";
  }

  return message ?? "We could not create your account.";
}
