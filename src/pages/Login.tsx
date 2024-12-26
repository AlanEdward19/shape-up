import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { signIn } from "@/utils/auth";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signIn(email, password, rememberMe);
      if (result.success) {
        toast.success("Login realizado com sucesso!");
        navigate("/index");
      } else {
        toast.error("Erro ao fazer login");
      }
    } catch (error) {
      toast.error("Erro ao fazer login");
      console.error("Login error:", error);
    }
  };

  const isFormValid = email.trim() !== "" && password.trim() !== "";

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

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md bg-transparent border-0 shadow-none">
          <CardContent className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold">Conectar-se</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <Input
                  type="email"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Lembrar-me
                  </label>
                </div>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Esqueceu sua senha?
                </Link>
              </div>
              <Button type="submit" className="w-full" disabled={!isFormValid}>
                Continuar
              </Button>
              <div className="text-center">
                <Link to="/signup" className="text-sm text-primary hover:underline">
                  Não possui conta? Crie sua conta
                </Link>
              </div>
              <div className="space-y-2">
                <Button variant="outline" className="w-full" type="button">
                  Entre com o Google
                </Button>
                <Button variant="outline" className="w-full" type="button">
                  Entre com o Facebook
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;