import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { signUp } from "@/utils/auth";
import { toast } from "sonner";

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerificationCode, setShowVerificationCode] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const handleSendVerificationCode = () => {
    setShowVerificationCode(true);
    console.log("Sending verification code to:", email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    try {
      const result = await signUp(email, password);
      if (result.success) {
        toast.success("Conta criada com sucesso!");
        navigate("/login");
      } else {
        toast.error("Erro ao criar conta");
      }
    } catch (error) {
      toast.error("Erro ao criar conta");
      console.error("Signup error:", error);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-center p-12 bg-secondary">
        <h1 className="text-4xl font-bold text-white mb-4">ShapeUp</h1>
        <p className="text-lg text-gray-300">
          Transforme sua rotina, conecte-se com sua evolução. Nutrição, treinos e
          amizades em um só lugar.
        </p>
      </div>

      {/* Right side - Signup Form */}
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button
                  type="button"
                  onClick={handleSendVerificationCode}
                  className="w-full"
                  disabled={showVerificationCode}
                >
                  Enviar código de confirmação
                </Button>
              </div>

              {showVerificationCode && (
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Código de verificação"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                  <Input
                    placeholder="Primeiro Nome"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <Input
                    placeholder="Sobrenome"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder="Confirmar Senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="País" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brasil">Brasil</SelectItem>
                      <SelectItem value="portugal">Portugal</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Cidade"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger>
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sp">São Paulo</SelectItem>
                      <SelectItem value="rj">Rio de Janeiro</SelectItem>
                      <SelectItem value="mg">Minas Gerais</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="submit" className="w-full">
                    Criar conta
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;