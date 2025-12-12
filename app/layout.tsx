import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Toaster } from "react-hot-toast";
import LayoutWrapper from "@/components/LayoutWrapper";

export const metadata: Metadata = {
  title: "Swiss Car Consulting",
  description: "Consultation automobile en Suisse",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="fr">
      <body
        className={`${GeistSans.className} flex min-h-screen w-screen flex-col items-center justify-center overflow-x-hidden antialiased`}
      >
        <Toaster position="top-right" reverseOrder={false} />
        <LayoutWrapper session={session}>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
