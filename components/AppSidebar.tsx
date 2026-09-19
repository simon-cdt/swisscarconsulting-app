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
import { Badge } from "./ui/badge";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// application/components/AppSidebar.tsx

// Attribue une couleur de fond distincte à chaque étape du cycle devis → facture
const getStageColorClass = (url: string): string => {
  switch (url) {
    case "/estimates/individual/tofinish":
    case "/estimates/insurance/tofinish":
      return "bg-slate-200 hover:bg-slate-300 dark:bg-slate-900/30 dark:hover:bg-slate-800/40"; // à finir

    case "/estimates/individual/pending":
    case "/estimates/insurance/pending":
      return "bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-800/40"; // en attente client

    case "/estimates/individual/accepted":
    case "/estimates/insurance/accepted":
      return "bg-lime-100 hover:bg-lime-200 dark:bg-lime-900/30 dark:hover:bg-lime-800/40"; // accepté

    case "/mechanical":
      return "bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-800/40"; // en cours au garage

    case "/mechanical/waiting-parts":
      return "bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/40"; // attente de pièces

    case "/invoices/pending":
      return "bg-violet-100 hover:bg-violet-200 dark:bg-violet-900/30 dark:hover:bg-violet-800/40"; // facture émise

    case "/invoices/paid":
      return "bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-800/40"; // encaissée

    default:
      return "";
  }
};

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
          title: "En attente",
          url: "/estimates/insurance/pending",
          icon: Hourglass,
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
          title: "Attente de pièces",
          url: "/mechanical/waiting-parts",
          icon: Hourglass,
        },
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
          url: "/invoices/paid",
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

type SidebarCounts = {
  intervention?: number;
  estimateIndividualPending?: number;
  estimateIndividualToFinish?: number;
  estimateIndividualAccepted?: number;
  estimateInsurancePending?: number;
  estimateInsuranceAccepted?: number;
  estimateInsuranceToFinish?: number;
  estimateSentGarage?: number;
  estimateWaitingParts?: number;
  invoicePending?: number;
  invoicePaid?: number;
};

function useSidebarCounts() {
  return useQuery<SidebarCounts>({
    queryKey: ["sidebar-count"],
    queryFn: async () => {
      const response = await fetch("/api/sidebar/count");
      return await response.json();
    },
  });
}

export function AppSidebar({
  intervention,
  estimateIndividualPending,
  estimateIndividualToFinish,
  estimateIndividualAccepted,
  estimateInsurancePending,
  estimateInsuranceAccepted,
  estimateInsuranceToFinish,
  estimateSentGarage,
  estimateWaitingParts,
  invoicePending,
  invoicePaid,
}: {
  intervention?: number;
  estimateIndividualPending?: number;
  estimateIndividualToFinish?: number;
  estimateIndividualAccepted?: number;
  estimateInsurancePending?: number;
  estimateInsuranceAccepted?: number;
  estimateInsuranceToFinish?: number;
  estimateSentGarage?: number;
  estimateWaitingParts?: number;
  invoicePending?: number;
  invoicePaid?: number;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { data: counts, refetch } = useSidebarCounts();

  useEffect(() => {
    refetch();
  }, [pathname, refetch]);

  return (
    <Sidebar>
      <SidebarHeader>
        <h1 className={`${GeistMono.className} px-3 py-2 text-base font-bold`}>
          Swiss Car Consulting SA
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
                      count = counts?.intervention;
                    } else if (item.url === "/estimates/individual/tofinish") {
                      count = counts?.estimateIndividualToFinish;
                    } else if (item.url === "/estimates/individual/pending") {
                      count = counts?.estimateIndividualPending;
                    } else if (item.url === "/estimates/individual/accepted") {
                      count = counts?.estimateIndividualAccepted;
                    } else if (item.url === "/estimates/insurance/pending") {
                      count = counts?.estimateInsurancePending;
                    } else if (item.url === "/estimates/insurance/tofinish") {
                      count = counts?.estimateInsuranceToFinish;
                    } else if (item.url === "/estimates/insurance/accepted") {
                      count = counts?.estimateInsuranceAccepted;
                    } else if (item.url === "/mechanical") {
                      count = counts?.estimateSentGarage;
                    } else if (item.url === "/mechanical/waiting-parts") {
                      count = counts?.estimateWaitingParts;
                    } else if (item.url === "/invoices/pending") {
                      count = counts?.invoicePending;
                    } else if (item.url === "/invoices/paid") {
                      count = counts?.invoicePaid;
                    }

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className={getStageColorClass(item.url)} // NOUVEAU — fond sur toute la ligne
                        >
                          <Link href={`/dashboard${item.url}`}>
                            <item.icon />
                            <span>{item.title}</span>
                            {count !== undefined && (
                              <Badge className="bg-transparent text-black">
                                {count}
                              </Badge>
                            )}
                          </Link>
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
            <Button variant={"ghost"} className="w-full">
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
