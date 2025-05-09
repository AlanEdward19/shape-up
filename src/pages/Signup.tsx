
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { signUp, sendVerificationCode, verifyCode } from "@/utils/auth";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, parse, isValid } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  postalCode: z.string().optional(),
  birthday: z.date({
    required_error: "Por favor, selecione uma data de aniversário",
  }).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const DATE_FORMAT = "dd-MM-yyyy";

const Signup = () => {
  const navigate = useNavigate();
  const [verificationCodeSent, setVerificationCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationValid, setVerificationValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailForm = useForm<z.infer<typeof verificationSchema>>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      email: "",
    },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      verificationCode: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
      country: "",
      city: "",
      state: "",
      postalCode: "",
      birthday: undefined,
    },
  });

  useEffect(() => {
    if (emailForm.watch("email")) {
      signupForm.setValue("email", emailForm.watch("email"));
    }
  }, [emailForm.watch("email")]);

  const handleSendVerificationCode = async (data: z.infer<typeof verificationSchema>) => {
    try {
      setIsSubmitting(true);
      
      const result = await sendVerificationCode(data.email);
      
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
    signupForm.setValue("verificationCode", value);
    
    if (value.length === 6) {
      const isValid = verifyCode(emailForm.watch("email"), value);
      setVerificationValid(isValid);
      
      if (isValid) {
        toast.success("Código verificado com sucesso!");
      } else {
        toast.error("Código inválido. Tente novamente.");
      }
    }
  };

  const handleSignup = async (data: z.infer<typeof signupSchema>) => {
    if (!verificationValid) {
      toast.error("Por favor, verifique seu email antes de continuar.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
        country: data.country,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        birthday: data.birthday ? data.birthday.toISOString() : null,
      };

      const result = await signUp(data.email, data.password, userData);
      
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

  // Function to handle manual date input
  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (date: Date | undefined) => void) => {
    const inputValue = e.target.value;
    
    if (!inputValue) {
      onChange(undefined);
      return;
    }
    
    // Parse the date from the input
    const parsedDate = parse(inputValue, DATE_FORMAT, new Date());
    
    // Only update if the date is valid
    if (isValid(parsedDate)) {
      onChange(parsedDate);
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
            
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(handleSendVerificationCode)} className="space-y-4">
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
              </form>
            </Form>

            {verificationCodeSent && (
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="verification-code">Código de verificação</Label>
                    <InputOTP
                      maxLength={6}
                      value={verificationCode}
                      onChange={handleVerificationCodeChange}
                      render={({ slots }) => (
                        <InputOTPGroup>
                          {slots && Array.from({ length: 6 }).map((_, index) => (
                            <InputOTPSlot key={index} index={index} />
                          ))}
                        </InputOTPGroup>
                      )}
                    />
                    {verificationValid && (
                      <p className="text-sm text-green-500">Código verificado!</p>
                    )}
                  </div>
                  
                  <FormField
                    control={signupForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primeiro Nome</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Primeiro Nome"
                            disabled={!verificationValid}
                          />
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
                          <Input
                            {...field}
                            placeholder="Sobrenome"
                            disabled={!verificationValid}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signupForm.control}
                    name="birthday"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data de aniversário</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                disabled={!verificationValid}
                              >
                                {field.value ? (
                                  format(field.value, DATE_FORMAT)
                                ) : (
                                  <span>Selecione uma data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <div className="p-2 border-b">
                              <Input
                                type="text"
                                placeholder={DATE_FORMAT}
                                value={field.value ? format(field.value, DATE_FORMAT) : ""}
                                onChange={(e) => handleDateInputChange(e, field.onChange)}
                                className="w-full"
                              />
                            </div>
                            <ScrollArea className="h-80">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                                className={cn("p-3 pointer-events-auto")}
                                fromYear={1900}
                                toYear={new Date().getFullYear()}
                                captionLayout="dropdown-buttons"
                                showOutsideDays
                              />
                            </ScrollArea>
                          </PopoverContent>
                        </Popover>
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
                          <Input
                            {...field}
                            type="password"
                            placeholder="Senha"
                            disabled={!verificationValid}
                          />
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
                          <Input
                            {...field}
                            type="password"
                            placeholder="Confirmar Senha"
                            disabled={!verificationValid}
                          />
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
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!verificationValid}
                        >
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
                          <Input
                            {...field}
                            placeholder="Cidade"
                            disabled={!verificationValid}
                          />
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
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!verificationValid}
                        >
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
                          <Input
                            {...field}
                            placeholder="Código Postal"
                            disabled={!verificationValid}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={!verificationValid || isSubmitting}
                  >
                    {isSubmitting ? "Criando conta..." : "Criar conta"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
