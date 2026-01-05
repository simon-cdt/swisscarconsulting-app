import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddClient from "./form/AddClient";
import AddCompany from "./form/AddCompany";
import { Building, User2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

const sharedFormSchema = z.object({
  // Champs communs
  email: z
    .string()
    .email("Ce n'est pas un e-mail.")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.number().optional(),
  city: z.string().optional(),
  // Champs spécifiques particulier
  firstName: z.string().optional(),
  name: z.string().optional(),
  // Champs spécifiques entreprise
  companyName: z.string().optional(),
  contactFirstName: z.string().optional(),
  contactName: z.string().optional(),
});

export type SharedFormData = z.infer<typeof sharedFormSchema>;

export default function CustomTabs() {
  const form = useForm<SharedFormData>({
    resolver: zodResolver(sharedFormSchema),
    defaultValues: {
      email: "",
      phone: "",
      address: "",
      postalCode: undefined,
      city: "",
      firstName: "",
      name: "",
      companyName: "",
      contactFirstName: "",
      contactName: "",
    },
  });

  const handleTabChange = (value: string) => {
    const currentValues = form.getValues();

    if (value === "company") {
      // Transférer firstName/name vers contactFirstName/contactName
      if (currentValues.firstName && !currentValues.contactFirstName) {
        form.setValue("contactFirstName", currentValues.firstName);
      }
      if (currentValues.name && !currentValues.contactName) {
        form.setValue("contactName", currentValues.name);
      }
    } else if (value === "individual") {
      // Transférer contactFirstName/contactName vers firstName/name
      if (currentValues.contactFirstName && !currentValues.firstName) {
        form.setValue("firstName", currentValues.contactFirstName);
      }
      if (currentValues.contactName && !currentValues.name) {
        form.setValue("name", currentValues.contactName);
      }
    }
  };

  return (
    <Tabs defaultValue="individual" onValueChange={handleTabChange}>
      <TabsList className="before:bg-border relative mb-4 h-auto w-full gap-0.5 bg-transparent p-0 before:absolute before:inset-x-0 before:bottom-0 before:h-px">
        <TabsTrigger
          value="individual"
          className="trans overflow-hidden rounded-b-none border-x border-t bg-sky-100 py-2 data-[state=active]:z-10 data-[state=active]:shadow-none"
        >
          <div className="flex items-center gap-1">
            <User2 className="size-4 text-sky-700" />
            <span className="text-sky-500">Particulier</span>
          </div>
        </TabsTrigger>
        <TabsTrigger
          value="company"
          className="trans overflow-hidden rounded-b-none border-x border-t bg-amber-100 py-2 data-[state=active]:z-10 data-[state=active]:shadow-none"
        >
          <div className="flex items-center gap-1">
            <Building className="size-4 text-amber-700" />
            <span className="text-amber-500">Entreprise</span>
          </div>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="individual">
        <AddClient sharedForm={form} />
      </TabsContent>
      <TabsContent value="company">
        <AddCompany sharedForm={form} />
      </TabsContent>
    </Tabs>
  );
}
