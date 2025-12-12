"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// LAYOUT WRAPPER POUR METTRE LES BALISES QUI NECESSITENT LE "USE CLIENT"
export default function LayoutWrapper({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const queryClient = new QueryClient();

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        {/* <Navbar /> */}
        <div className="flex min-h-screen w-full flex-col items-center overflow-x-hidden">
          {children}
        </div>
        {/* <Footer /> */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
}
