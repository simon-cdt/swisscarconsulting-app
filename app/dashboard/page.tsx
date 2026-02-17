"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { FileText, Wrench, DollarSign, Car } from "lucide-react";

// Données fictives pour les revenus mensuels
const revenueData = [
  { month: "Jan", revenue: 12500, expenses: 8200 },
  { month: "Fév", revenue: 15300, expenses: 9100 },
  { month: "Mar", revenue: 18700, expenses: 10500 },
  { month: "Avr", revenue: 16200, expenses: 9800 },
  { month: "Mai", revenue: 21500, expenses: 11200 },
  { month: "Juin", revenue: 19800, expenses: 10800 },
];

// Données fictives pour les statuts de devis
const estimateStatusData = [
  { status: "À terminer", count: 8 },
  { status: "En attente", count: 12 },
  { status: "Accepté", count: 24 },
  { status: "Envoyé garage", count: 6 },
  { status: "Terminé", count: 45 },
];

// Données fictives pour les interventions par mois
const interventionsData = [
  { month: "Jan", interventions: 32 },
  { month: "Fév", interventions: 41 },
  { month: "Mar", interventions: 38 },
  { month: "Avr", interventions: 45 },
  { month: "Mai", interventions: 52 },
  { month: "Juin", interventions: 48 },
];

// Données fictives pour les statuts de factures
const invoiceStatusData = [
  { status: "Payée", value: 78, color: "#22c55e" },
  { status: "En attente", value: 22, color: "#eab308" },
];

// Données fictives pour les nouveaux clients par mois
const clientsData = [
  { month: "Jan", entreprise: 8, particulier: 12 },
  { month: "Fév", entreprise: 10, particulier: 15 },
  { month: "Mar", entreprise: 7, particulier: 18 },
  { month: "Avr", entreprise: 12, particulier: 14 },
  { month: "Mai", entreprise: 9, particulier: 20 },
  { month: "Juin", entreprise: 11, particulier: 17 },
];

// Configuration des couleurs pour les graphiques
const chartConfig = {
  revenue: {
    label: "Revenus",
    color: "#f59e0b",
  },
  expenses: {
    label: "Dépenses",
    color: "#3b82f6",
  },
  interventions: {
    label: "Interventions",
    color: "#8b5cf6",
  },
  count: {
    label: "Nombre",
    color: "#10b981",
  },
};

export default function DashboardPage() {
  // Calcul des statistiques clés
  const totalRevenue = revenueData.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalEstimates = estimateStatusData.reduce(
    (acc, curr) => acc + curr.count,
    0,
  );
  const totalInterventions = interventionsData.reduce(
    (acc, curr) => acc + curr.interventions,
    0,
  );
  const totalClients = clientsData.reduce(
    (acc, curr) => acc + curr.entreprise + curr.particulier,
    0,
  );

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* En-tête */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Aperçu de l&apos;activité et des performances
        </p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenus totaux
            </CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRevenue.toLocaleString("fr-CH")} CHF
            </div>
            <p className="text-muted-foreground text-xs">
              +12.5% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devis</CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEstimates}</div>
            <p className="text-muted-foreground text-xs">
              {estimateStatusData[2].count} acceptés ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interventions</CardTitle>
            <Wrench className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInterventions}</div>
            <p className="text-muted-foreground text-xs">
              {interventionsData[interventionsData.length - 1].interventions} ce
              mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Car className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-muted-foreground text-xs">
              Nouveaux clients ces 6 mois
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenus et dépenses */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Revenus et dépenses</CardTitle>
            <CardDescription>Évolution sur les 6 derniers mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-75 w-full">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Revenus (CHF)"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Dépenses (CHF)"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Statut des devis */}
        <Card>
          <CardHeader>
            <CardTitle>Statut des devis</CardTitle>
            <CardDescription>Répartition actuelle</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-75 w-full">
              <BarChart data={estimateStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count"
                  fill="#10b981"
                  radius={[8, 8, 0, 0]}
                  name="Nombre"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Interventions par mois */}
        <Card>
          <CardHeader>
            <CardTitle>Interventions mensuelles</CardTitle>
            <CardDescription>
              Nombre d&apos;interventions par mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-75 w-full">
              <BarChart data={interventionsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="interventions"
                  fill="#8b5cf6"
                  radius={[8, 8, 0, 0]}
                  name="Interventions"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Statut des factures */}
        <Card>
          <CardHeader>
            <CardTitle>Statut des factures</CardTitle>
            <CardDescription>Répartition en pourcentage</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-75 w-full">
              <PieChart>
                <Pie
                  data={invoiceStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, value }) => `${status}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {invoiceStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Nouveaux clients par type */}
        <Card>
          <CardHeader>
            <CardTitle>Nouveaux clients</CardTitle>
            <CardDescription>
              Entreprises vs Particuliers par mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-75 w-full">
              <BarChart data={clientsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar
                  dataKey="entreprise"
                  fill="#f59e0b"
                  name="Entreprises"
                  stackId="clients"
                />
                <Bar
                  dataKey="particulier"
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                  name="Particuliers"
                  stackId="clients"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
