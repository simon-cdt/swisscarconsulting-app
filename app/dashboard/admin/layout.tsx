import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.id) {
    redirect("/");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/client-handle");
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center">
      {children}
    </div>
  );
}
