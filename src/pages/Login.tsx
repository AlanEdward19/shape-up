import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useQueryClient } from "@tanstack/react-query";
import { SocialService } from "@/services/socialService.ts";
import { toast } from "sonner";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { Facebook, Mail, Eye, EyeOff } from "lucide-react";
import AuthLayout from "@/components/templates/AuthLayout";
import Button from "@/components/atoms/Button";
import {signInWithEmail, signInWithGoogle, signInWithFacebook, setAuthData, getAuthToken} from "@/services/authService.ts";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const autoLogin = async () => {
      const authToken = localStorage.getItem('authToken');
      const refreshToken = localStorage.getItem('refreshToken');
      if (authToken && refreshToken) {
        const validToken = await getAuthToken();
        if (validToken) {
          navigate('/index', { replace: true });
        }
      }
    };
    autoLogin();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await signInWithEmail(email, password, rememberMe);
      
      if (result.success) {
        const token = await result.user?.getIdToken();

        console.log(`Token: ${token}`);

        await setAuthData(token, rememberMe);
        toast.success("Login realizado com sucesso!");
        navigate('/index', { replace: true });
      } else {
        toast.error("Falha no login. Tente novamente.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Falha no login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithGoogle(rememberMe);
      
      if (result.success) {
        const userId = result.user?.uid;
        const token = await result.user?.getIdToken();

        console.log(`Id: ${userId}`);
        console.log(`Token: ${token}`);

        toast.success("Login com Google realizado com sucesso!");
        await setAuthData(token, rememberMe);
        navigate('/index', { replace: true });
      } else {
        toast.error("Falha no login com Google. Tente novamente.");
      }
    } catch (error) {
      console.error("Google login failed:", error);
      toast.error("Falha no login com Google. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithFacebook(rememberMe);
      
      if (result.success) {
        const userId = result.user?.uid;
        const token = await result.user?.getIdToken();

        console.log(`Id: ${userId}`);
        console.log(`Token: ${token}`);

        toast.success("Login com Facebook realizado com sucesso!");
        await setAuthData(token, rememberMe);
        navigate('/index', { replace: true });
      } else {
        toast.error("Falha no login com Facebook. Tente novamente.");
      }
    } catch (error) {
      console.error("Facebook login failed:", error);
      toast.error("Falha no login com Facebook. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Login" 
      subtitle="Entre com suas credenciais"
    >
      <div className="space-y-4">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continuar com Google
        </Button>

        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleFacebookLogin}
          disabled={isLoading}
        >
          <Facebook className="mr-2 h-5 w-5" />
          Continuar com Facebook
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Ou continue com
            </span>
          </div>
        </div>
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
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-white" />
              ) : (
                <Eye className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="rememberMe"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            disabled={isLoading}
          />
          <Label htmlFor="rememberMe">Lembrar-me</Label>
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={!email || !password || isLoading}
        >
          <Mail className="mr-2 h-4 w-4" />
          Continuar com Email
        </Button>
      </form>
      <div className="space-y-4 text-center">
        <Button variant="link" onClick={() => navigate("/forgot-password")} disabled={isLoading}>
          Esqueceu sua senha?
        </Button>
        <div className="space-y-2">
          <p className="text-muted-foreground">Não possui uma conta?</p>
          <Button variant="outline" className="w-full" onClick={() => navigate("/signup")} disabled={isLoading}>
            Criar conta
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
