import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { sendPasswordReset } from "@/services/authService";
import shapeUpLogo from "@/images/shape_up.svg";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    const result = await sendPasswordReset(email);
    setLoading(false);
    if (result.success) {
      setMessage(
          "Instruções de recuperação de senha foram enviadas para seu email."
      );
    } else {
      setError("Erro ao enviar instruções. Verifique o email informado.");
    }
  };

  return (
      <div className="min-h-screen flex bg-background">
        {/* Left side - Branding (restilizado igual AuthLayout) */}
        <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
          {/* Fundo em tons de cinza */}
          <div
              className="absolute inset-0"
              style={{
                background:
                    "linear-gradient(135deg, #151a24 0%, #1b2230 45%, #202838 100%)",
              }}
          />

          {/* Textura sutil */}
          <div
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                    "radial-gradient(rgba(203,213,225,.25) 1px, transparent 1.3px)",
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
              <span className="text-gray-100">
              Nutrição, treinos e amizades em um só lugar.
            </span>
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
                      disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar instruções de recuperação"}
                </Button>
                {message && (
                    <div className="text-green-600 text-sm mt-2">{message}</div>
                )}
                {error && (
                    <div className="text-red-600 text-sm mt-2">{error}</div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
  );
};

export default ForgotPassword;
