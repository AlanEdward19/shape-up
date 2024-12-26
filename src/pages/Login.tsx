import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useQueryClient } from "@tanstack/react-query";
import { SocialService } from "@/services/api";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Simulate login - replace with actual login logic
      const userId = "123"; // This should come from your login response
      
      if (rememberMe) {
        localStorage.setItem("userId", userId);
      } else {
        sessionStorage.setItem("userId", userId);
      }

      // Prefetch follow data
      await queryClient.prefetchQuery({
        queryKey: ['currentUserFollowData', userId],
        queryFn: () => SocialService.getCurrentUserFollowData(userId)
      });

      navigate("/index");
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Falha no login. Tente novamente.");
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm space-y-6 p-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-gray-500">Entre com suas credenciais</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="rememberMe">Lembrar-me</Label>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={!email || !password}
            >
              Continuar
            </Button>
          </form>
          <div className="text-center">
            <Button variant="link" onClick={() => navigate("/forgot-password")}>
              Esqueceu sua senha?
            </Button>
          </div>
        </div>
      </div>
      <div className="hidden lg:block flex-1 bg-gray-100" />
    </div>
  );
};

export default Login;