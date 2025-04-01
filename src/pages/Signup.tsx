import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { signUp, sendVerificationCode, verifyCode } from "@/utils/auth";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const verificationSchema = z.object({
  email: z.string().email("Email inválido"),
});

const signupSchema = z.object({
  email: z.string().email("Email inválido"),
  verificationCode: z.string().min(6, "Código deve ter 6 dígitos"),
  firstName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  lastName: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
  country: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [verificationCodeSent, setVerificationCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationValid, setVerificationValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const emailForm = useForm<z.infer<typeof verificationSchema>>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSendVerificationCode = async () => {
    try {
      setIsSubmitting(true);
      const validEmail = await emailForm.trigger("email");
      
      if (!validEmail) {
        return;
      }
      
      const result = await sendVerificationCode(email);
      
      if (result.success) {
        setVerificationCodeSent(true);
        toast.success("Código de verificação enviado! Verifique seu email.");
      } else {
        if (result.error?.code === 'auth/email-already-in-use') {
          toast.error("Este email já está em uso.");
        } else {
          toast.error("Erro ao enviar código de verificação. Tente novamente.");
        }
      }
    } catch (error) {
      console.error("Error sending verification code:", error);
      toast.error("Erro ao enviar código de verificação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationCodeChange = (value: string) => {
    setVerificationCode(value);
    
    if (value.length === 6) {
      const isValid = verifyCode(email, value);
      setVerificationValid(isValid);
      
      if (isValid) {
        toast.success("Código verificado com sucesso!");
      } else {
        toast.error("Código inválido. Tente novamente.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationValid) {
      toast.error("Por favor, verifique seu email antes de continuar.");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const userData = {
        firstName,
        lastName,
        country,
        city,
        state,
      };

      const result = await signUp(email, password, userData);
      
      if (result.success) {
        toast.success("Conta criada com sucesso! Verifique seu email para confirmar.");
        navigate("/login");
      } else {
        toast.error("Erro ao criar conta");
      }
    } catch (error) {
      toast.error("Erro ao criar conta");
      console.error("Signup error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex lg:flex-1 flex-col justify-center p-12 bg-secondary">
        <h1 className="text-4xl font-bold text-white mb-4">ShapeUp</h1>
        <p className="text-lg text-gray-300">
          Transforme sua rotina, conecte-se com sua evolução. Nutrição, treinos e
          amizades em um só lugar.
        </p>
      </div>

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
            
            <form onSubmit={emailForm.handleSubmit(handleSendVerificationCode)} className="space-y-4">
              <div className="space-y-2">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Seu email"
                          disabled={verificationCodeSent}
                          onChange={(e) => {
                            field.onChange(e);
                            setEmail(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || verificationCodeSent}
                >
                  {isSubmitting ? "Enviando..." : "Enviar código de confirmação"}
                </Button>
              </div>
            </form>

            {verificationCodeSent && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="verification-code">Código de verificação</Label>
                    <InputOTP
                      maxLength={6}
                      value={verificationCode}
                      onChange={handleVerificationCodeChange}
                      render={({ slots }) => (
                        <InputOTPGroup>
                          {slots.map((slot, index) => (
                            <InputOTPSlot key={index} {...slot} index={index} />
                          ))}
                        </InputOTPGroup>
                      )}
                    />
                    {verificationValid && (
                      <p className="text-sm text-green-500">Código verificado!</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Primeiro Nome</Label>
                    <Input
                      id="firstName"
                      placeholder="Primeiro Nome"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={!verificationValid}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input
                      id="lastName"
                      placeholder="Sobrenome"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={!verificationValid}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={!verificationValid}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirmar Senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={!verificationValid}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">País</Label>
                    <Select 
                      value={country} 
                      onValueChange={setCountry}
                      disabled={!verificationValid}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="País" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brasil">Brasil</SelectItem>
                        <SelectItem value="portugal">Portugal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      placeholder="Cidade"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      disabled={!verificationValid}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Select 
                      value={state} 
                      onValueChange={setState}
                      disabled={!verificationValid}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sp">São Paulo</SelectItem>
                        <SelectItem value="rj">Rio de Janeiro</SelectItem>
                        <SelectItem value="mg">Minas Gerais</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={!verificationValid || isSubmitting}
                  >
                    {isSubmitting ? "Criando conta..." : "Criar conta"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
