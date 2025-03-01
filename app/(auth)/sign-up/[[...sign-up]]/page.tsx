import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex h-screen items-center justify-center">
      <SignUp
        fallbackRedirectUrl="/home"
        signInFallbackRedirectUrl="/sign-in" // 🔹 Provide a valid sign-in route
      />
    </div>
  );
}
