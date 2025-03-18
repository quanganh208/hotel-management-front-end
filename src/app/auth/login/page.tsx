import type { Metadata } from "next";
import Image from "next/image";
import LoginForm from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Hotel Management System | Login",
  description: "Login to access the Hotel Management System",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left side - Image */}
      <div className="hidden w-1/2 bg-muted lg:block">
        <div className="relative h-full w-full">
          <Image
            src="/placeholder.svg?height=1080&width=1920"
            alt="Hotel lobby"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="mx-auto w-full max-w-md p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
