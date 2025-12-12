"use client";

import { Button } from "@/components/ui/button";
import { LogOut as LogOutIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import { redirect } from "next/navigation";

export default function LogOut() {
  async function handleSignOut() {
    await signOut();
    redirect("/");
  }

  return (
    <Button size="icon" variant="outline" onClick={handleSignOut}>
      <LogOutIcon />
    </Button>
  );
}
