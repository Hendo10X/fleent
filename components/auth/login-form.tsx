"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeSlash } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setIsSubmitting(true);

    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      rememberMe: true,
    });

    setIsSubmitting(false);

    if (error) {
      toast.error(authErrorMessage(error.message));
      return;
    }

    toast.success("Logged in successfully.");

    window.setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 450);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
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
              autoComplete="current-password"
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
          Log in
          <ArrowRight size={16} weight="bold" />
        </Button>
    </form>
  );
}

function authErrorMessage(message?: string) {
  const normalized = message?.toLowerCase() ?? "";

  if (normalized.includes("user") && normalized.includes("not")) {
    return "This user cannot be found.";
  }

  if (normalized.includes("password") || normalized.includes("invalid")) {
    return "The email or password is incorrect.";
  }

  return message ?? "We could not sign you in.";
}
