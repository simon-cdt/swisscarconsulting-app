"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-xl text-gray-600">Page non trouvée</p>
      <Button onClick={() => router.back()} className="mt-4">
        <ArrowLeft className="mr-2 size-4" />
        Retour
      </Button>
    </div>
  );
}
