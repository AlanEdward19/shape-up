import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Password reset requested for:", email);
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

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md bg-transparent border-0 shadow-none">
          <CardContent className="space-y-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/login")}
                className="absolute top-4 left-4"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <h2 className="text-2xl font-semibold text-center flex-1">
                Recuperar Senha
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Enviar instruções de recuperação
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;