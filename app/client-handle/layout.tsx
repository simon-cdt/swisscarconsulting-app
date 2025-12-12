import LogOut from "@/components/LogOut";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function ClientHandleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.id) {
    redirect("/");
  }

  if (session.user.role === "SELLER") {
    redirect("/dashboard");
  }

  return (
    <div>
      <div className="absolute top-5 right-16 flex items-center gap-5">
        {session.user.role !== "MECHANIC" && (
          <a href="/dashboard">
            <Button className="border border-black/10 bg-gray-200/50 text-black hover:bg-gray-200">
              Accéder à l&apos;administration
            </Button>
          </a>
        )}
        <LogOut />
      </div>
      <div className="flex flex-col items-center">{children}</div>
    </div>
  );
}
