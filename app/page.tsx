"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/form/FormField";
import { Spinner } from "@/components/ui/spinner";

export default function Home() {
  const router = useRouter();
  const zodFormSchema = z.object({
    username: z.string().nonempty("Le nom d'utilisateur est requis."),
    password: z.string().nonempty("Le mot de passe est requis."),
  });
  type FormSchema = z.infer<typeof zodFormSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(zodFormSchema),
  });

  const handleSubmitForm = async (data: FormSchema) => {
    const signInData = await signIn("credentials", {
      username: data.username,
      password: data.password,
      redirect: false,
    });
    if (signInData?.error) {
      toast.error(signInData.error);
    } else {
      toast.success("La connexion a bien réussie");
      router.push("/dashboard");
    }
  };
  return (
    <form
      onSubmit={handleSubmit(handleSubmitForm)}
      className="flex h-screen w-full max-w-sm items-center justify-center"
    >
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className={`text-xl font-bold`}>
            Connexion au compte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <FormField
              label="Nom d'utilisateur"
              name="username"
              type="text"
              register={register}
              error={errors.username}
            />
            <FormField
              label="Mot de passe"
              name="password"
              type="password"
              register={register}
              error={errors.password}
              placeholder="********"
            />
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : "Se connecter"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
