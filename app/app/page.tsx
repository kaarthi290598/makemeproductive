"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    router.push("/app/todo");
  }, [router]);

  return null; // Optionally, you can render a loading indicator here
};

export default Page;
