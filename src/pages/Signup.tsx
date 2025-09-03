import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { signUp, sendVerificationCode, resendEmailVerification } from "@/services/authService.ts";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import shapeUpLogo from "@/images/shape_up.svg";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const emailSchema = z.object({
  email: z.string().email("Email inválido"),
});

const signupSchema = z
  .object({
    email: z.string().email("Email inválido"),
    firstName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    lastName: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
    country: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    birthday: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.password && data.confirmPassword) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "As senhas não coincidem",
      path: ["confirmPassword"],
    }
  );

const Signup = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
      country: "",
      city: "",
      state: "",
      postalCode: "",
      birthday: "",
    },
  });

  useEffect(() => {
    if (emailForm.watch("email")) {
      signupForm.setValue("email", emailForm.watch("email"));
    }
  }, [emailForm.watch("email")]);

  const handleCheckEmail = async (data: z.infer<typeof emailSchema>) => {
    setIsSubmitting(true);
    try {
      // Check if email is already in use
      const result = await sendVerificationCode(data.email);
      if (result.success) {
        setEmailChecked(true);
        toast.success("Email disponível! Preencha os dados para criar sua conta.");
      } else {
        if (result.error?.code === "auth/email-already-in-use") {
          toast.error("Este email já está em uso.");
        } else {
          toast.error("Erro ao verificar email. Tente novamente.");
        }
      }
    } catch (error) {
      toast.error("Erro ao verificar email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (data: z.infer<typeof signupSchema>) => {
    setIsSubmitting(true);
    try {
      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
        country: data.country,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        birthday: data.birthday || null,
      };
      const result = await signUp(data.email, data.password, userData);
      if (result.success) {
        // Use the new reusable function to send the verification link
        await resendEmailVerification(result.user);
        setShowConfirmationModal(true);
      } else {
        toast.error("Erro ao criar conta");
      }
    } catch (error) {
      toast.error("Erro ao criar conta");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalOk = () => {
    setShowConfirmationModal(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Branding (tons de cinza, slogan aparente, logo maior) */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        {/* Fundo em tons de cinza/graphite */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, #151a24 0%, #1b2230 45%, #202838 100%)",
          }}
        />
        {/* Textura sutil */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "radial-gradient(rgba(203,213,225,.25) 1px, transparent 1.3px)",
            backgroundSize: "20px 20px",
          }}
        />
        {/* Borda divisória */}
        <div className="absolute top-0 right-0 h-full w-px bg-white/10" />

        {/* Conteúdo */}
        <div className="relative z-10 flex flex-col justify-center p-16 mx-auto max-w-2xl">
          <h1 className="text-5xl font-extrabold tracking-tight text-white drop-shadow-sm">
            ShapeUp
          </h1>
          <p className="mt-6 text-2xl leading-relaxed text-gray-200/95">
            Transforme sua rotina, conecte-se com sua evolução.{" "}
            <span className="text-gray-100">Nutrição, treinos e amizades em um só lugar.</span>
          </p>
          <img
            src={shapeUpLogo}
            alt="ShapeUp Logo"
            className="mx-auto mt-10 w-64 h-auto md:w-72 lg:w-80"
          />
          <div className="mt-10 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>

      {/* Right side - Form (inalterado) */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md bg-transparent border-0 shadow-none">
          <CardContent className="space-y-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <h2 className="text-2xl font-semibold text-center flex-1">Criar Conta</h2>
            </div>

            {!emailChecked && (
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(handleCheckEmail)} className="space-y-4">
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="Seu email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Verificando..." : "Verificar email"}
                  </Button>
                </form>
              </Form>
            )}

            {emailChecked && (
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                  <FormField
                    control={signupForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primeiro Nome</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Primeiro Nome" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sobrenome</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Sobrenome" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="birthday"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de aniversário</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value || ""} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" placeholder="Senha" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Senha</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" placeholder="Confirmar Senha" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>País</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="País" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="brasil">Brasil</SelectItem>
                            <SelectItem value="portugal">Portugal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Cidade" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sp">São Paulo</SelectItem>
                            <SelectItem value="rj">Rio de Janeiro</SelectItem>
                            <SelectItem value="mg">Minas Gerais</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código Postal</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Código Postal" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Criando conta..." : "Criar conta"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirme sua conta</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-base text-white">
            Um link de confirmação foi enviado para o seu email.<br />
            É necessário confirmar sua conta para prosseguir com o login.
          </div>
          <DialogFooter>
            <Button
              className="w-full bg-[#0FA0CE] text-white hover:bg-[#0FA0CE] focus:bg-[#0FA0CE]"
              onClick={handleModalOk}
            >
              Ok
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Signup;
