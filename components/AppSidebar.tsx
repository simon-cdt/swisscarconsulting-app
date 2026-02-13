"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  ClipboardList,
  FileCheck,
  FileOutput,
  Hourglass,
  LayoutDashboard,
  LogOutIcon,
  Send,
  User2,
  Users2,
  Wallet,
  ToolCase,
  Trash,
  Wrench,
  Calendar,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Separator } from "./ui/separator";
import { GeistMono } from "geist/font/mono";
import { usePathname } from "next/navigation";
import { Badge } from "./ui/badge";

const data = {
  nav: [
    {
      title: "Gestion",
      items: [
        {
          title: "Tableau de bord",
          url: "",
          icon: LayoutDashboard,
        },
        {
          title: "Calendrier",
          url: "/calendar",
          icon: Calendar,
        },
        {
          title: "Interventions",
          url: "/interventions",
          icon: ToolCase,
        },
      ],
    },
    {
      title: "Devis individuel",
      items: [
        {
          title: "À finir",
          url: "/estimates/individual/tofinish",
          icon: ClipboardList,
        },
        {
          title: "En attente",
          url: "/estimates/individual/pending",
          icon: Hourglass,
        },
        {
          title: "Acceptés",
          url: "/estimates/individual/accepted",
          icon: FileCheck,
        },
      ],
    },
    {
      title: "Devis assurance",
      items: [
        {
          title: "À finir",
          url: "/estimates/insurance/tofinish",
          icon: ClipboardList,
        },
        {
          title: "Acceptés",
          url: "/estimates/insurance/accepted",
          icon: FileCheck,
        },
      ],
    },
    {
      title: "Mécanique",
      items: [
        {
          title: "En cours",
          url: "/mechanical",
          icon: Wrench,
        },
      ],
    },
    {
      title: "Factures",
      items: [
        {
          title: "Emises",
          url: "/invoices/pending",
          icon: FileOutput,
        },
        {
          title: "Encaissées",
          url: "/factures/paid",
          icon: Wallet,
        },
      ],
    },
    {
      title: "Assurances",
      items: [
        {
          title: "Envoyés",
          url: "/assurances/sent",
          icon: Send,
        },
        {
          title: "Encaissées",
          url: "/assurances/paid",
          icon: Wallet,
        },
      ],
    },
    {
      title: "Administrateur",
      onlyAdmin: true,
      items: [
        {
          title: "Utilisateurs",
          url: "/admin",
          icon: Users2,
        },
      ],
    },
    {
      title: "Corbeille",
      items: [
        {
          title: "Corbeille",
          url: "/trash",
          icon: Trash,
        },
      ],
    },
  ],
};

export function AppSidebar({
  intervention,
  estimateIndividualPending,
  estimateIndividualToFinish,
  estimateIndividualAccepted,
  estimateInsuranceAccepted,
  estimateInsuranceToFinish,
  estimateSentGarage,
}: {
  intervention?: number;
  estimateIndividualPending?: number;
  estimateIndividualToFinish?: number;
  estimateIndividualAccepted?: number;
  estimateInsuranceAccepted?: number;
  estimateInsuranceToFinish?: number;
  estimateSentGarage?: number;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <h1 className={`${GeistMono.className} px-3 py-2 text-base font-bold`}>
          Swiss Car Consulting
        </h1>
      </SidebarHeader>
      <SidebarContent>
        {data.nav.map((item) => {
          if (item.onlyAdmin && session?.user.role !== "ADMIN") {
            return null;
          }

          return (
            <SidebarGroup key={item.title}>
              <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {item.items.map((item) => {
                    const isActive =
                      item.url === pathname.replace("/dashboard", "");

                    // Déterminer le compteur à afficher
                    let count: number | undefined;
                    if (item.url === "/interventions") {
                      count = intervention;
                    } else if (item.url === "/estimates/individual/pending") {
                      count = estimateIndividualPending;
                    } else if (item.url === "/estimates/individual/tofinish") {
                      count = estimateIndividualToFinish;
                    } else if (item.url === "/estimates/individual/accepted") {
                      count = estimateIndividualAccepted;
                    } else if (item.url === "/estimates/insurance/tofinish") {
                      count = estimateInsuranceToFinish;
                    } else if (item.url === "/estimates/insurance/accepted") {
                      count = estimateInsuranceAccepted;
                    } else if (item.url === "/mechanical") {
                      count = estimateSentGarage;
                    }

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <a href={`/dashboard/${item.url}`}>
                            <item.icon
                              className={`size-4 ${isActive ? "text-black" : "text-black/70"}`}
                            />
                            <span>{item.title}</span>
                            {count !== undefined && (
                              <Badge variant="secondary" className="ml-auto">
                                {count}
                              </Badge>
                            )}
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <Separator />
      <SidebarFooter>
        {session?.user.role !== "SELLER" && (
          <Link href="/client-handle">
            <Button variant={"ghost"} className="w-full hover:bg-gray-200">
              Accédez au garage
            </Button>
          </Link>
        )}
        <div className="flex items-center justify-between px-2 pb-3">
          <div className="flex items-center gap-2">
            <User2 className="size-6" />
            <p className="font-semibold">{session?.user.username}</p>
          </div>
          <button
            className="pointer trans rounded-md p-2 hover:bg-gray-200"
            onClick={() => signOut()}
          >
            <LogOutIcon className="size-5" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
