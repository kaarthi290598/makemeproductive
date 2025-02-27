import {
  HomeIcon,
  LogIn,
  LogOut,
  Menu,
  Search,
  UserRoundPlus,
} from "lucide-react";
import { Button } from "./button";
import { ModeToggle } from "../darkModeToggle";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "md:borde absolute inset-x-0 top-4 z-50 mx-auto flex w-full justify-end rounded-full md:w-fit md:justify-center md:shadow-lg",
        className,
      )}
    >
      <div className="hidden w-fit items-center gap-4 px-4 py-2 md:flex">
        <Button variant="link" className="text-md">
          Explore Features <Search />
        </Button>
        <SignedOut>
          <Link href="/sign-in">
            <Button variant="link" className="text-md">
              Sign In <LogIn />
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button variant="link" className="text-md">
              Sign Up <UserRoundPlus />
            </Button>
          </Link>
        </SignedOut>
        <SignedIn>
          <Link href="/home">
            <Button variant="link" className="text-md">
              Go to Home <HomeIcon />
            </Button>
          </Link>
          <SignOutButton>
            <Button variant="link" className="text-md">
              Sign Out <LogOut />
            </Button>
          </SignOutButton>
        </SignedIn>
        <ModeToggle />
      </div>

      <div className="flex items-center gap-4 px-4 py-2 md:hidden">
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-md">
              <Menu />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {/* Signed Out Menu Items */}
            <SignedOut>
              <DropdownMenuItem asChild>
                <Link href="/sign-in">
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/sign-up">
                  <div className="flex items-center gap-2">
                    <UserRoundPlus className="h-4 w-4" />
                    Sign Up
                  </div>
                </Link>
              </DropdownMenuItem>
            </SignedOut>

            {/* Signed In Menu Items */}
            <SignedIn>
              <DropdownMenuItem asChild>
                <Link href="/home">
                  <div className="flex items-center gap-2">
                    <HomeIcon className="h-4 w-4" />
                    Go to Home
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <SignOutButton>
                  <div className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </div>
                </SignOutButton>
              </DropdownMenuItem>
            </SignedIn>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
