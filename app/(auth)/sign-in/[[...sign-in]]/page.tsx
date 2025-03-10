import { SignIn, SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex h-screen items-center justify-center">
      <SignIn fallbackRedirectUrl="/home" />
    </div>
  );
}
