import { GeistMono } from "geist/font/mono";
import React from "react";

export default function LoadingPage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <p className={`${GeistMono.className}`}>Chargement...</p>
    </div>
  );
}
