import { GeistMono } from "geist/font/mono";
import React from "react";

export default function ErrorPage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <p className={`${GeistMono.className} text-red-500`}>
        Une erreur est survenue
      </p>
    </div>
  );
}
