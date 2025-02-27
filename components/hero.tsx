import React from "react";

import { SparklesText } from "./ui/sparkles-text";
import { PulsatingButton } from "./ui/pulsating-button";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { GridPattern } from "./ui/grid-pattern";
import { cn } from "@/lib/utils";

const Hero = () => {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center h-screen">
      <GridPattern
        squares={[
          [4, 4],
          [5, 1],
          [8, 2],
          [5, 3],
          [5, 5],
          [10, 10],
          [12, 15],
          [15, 10],
          [10, 15],
          [15, 10],
          [10, 15],
          [15, 10],
        ]}
        className={cn(
          "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
          "[-webkit-mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
        )}
      />
      <div className="flex flex-col items-center justify-center gap-8 text-center">
        <h1 className=" text-5xl md:text-6xl lg:text-8xl  tracking-wide">
          All-in-One
          <SparklesText className="" text="Productivity Hub" />
        </h1>
        <p className=" max-w-[80%] lg:max-w-[70%] font-light text-sm md:text-lg ">
          Organize your life with ease! From tracking tasks to planning meals,
          managing passwords, and generating QR codes
        </p>
        <SignedIn>
          <Link href="/home">
            <PulsatingButton>Go to Home</PulsatingButton>
          </Link>
        </SignedIn>
        <SignedOut>
          <Link href="/sign-up">
            <PulsatingButton>Sign Up Now for free</PulsatingButton>
          </Link>
        </SignedOut>
      </div>
    </div>
  );
};

export default Hero;
