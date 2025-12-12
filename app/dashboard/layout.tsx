import SideBar from "@/components/SideBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.id) {
    redirect("/");
  }

  if (session.user.role === "MECHANIC") {
    redirect("/client-handle");
  }

  return (
    <SidebarProvider>
      <SideBar />
      <main className="min-h-screen w-full">{children}</main>
    </SidebarProvider>
  );
}
