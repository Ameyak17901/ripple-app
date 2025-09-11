"use client";

import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";

const Header = () => {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");
  return (
    <header className="flex items-center justify-between px-4 h-15 sm:px-6">
      <Link href="/dashboard" className="font-medium uppercase tracking-widest">
        Ripple
      </Link>
      <div>
        <Authenticated>
          {!isDashboard && (
            <Button variant="outline">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          )}
          <UserButton />
        </Authenticated>
        <Unauthenticated>
          <SignInButton
            mode="modal"
            forceRedirectUrl={"/dashboard"}
            signUpForceRedirectUrl={"/dashboard"}
          >
            <Button variant="outline">Sign In</Button>
          </SignInButton>
        </Unauthenticated>
      </div>
    </header>
  );
};

export default Header;
