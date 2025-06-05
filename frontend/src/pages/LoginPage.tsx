import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { firebaseAuth } from "app"; // Will be used later
import { signInWithEmailAndPassword } from "firebase/auth"; // Will be used later

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // console.log("Attempting login with:", { email, password });
    // toast.info(`Tentando login com email: ${email}. Verifique o console.`);

    // Placeholder for Firebase auth logic
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      // const user = userCredential.user; // Not strictly needed here unless you want to use the user object immediately
      toast.success("Login realizado com sucesso!");
      navigate(from, { replace: true }); // Redirect to the page user came from or home
    } catch (error: any) {
      console.error("Firebase login error:", error);
      let errorMessage = "Falha no login. Verifique suas credenciais.";
      // Customize error messages based on Firebase error codes
      if (error.code === "auth/user-not-found" || error.code === "auth/invalid-email") {
        errorMessage = "Usuário não encontrado ou email inválido.";
      } else if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        errorMessage = "Senha incorreta.";
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
    // setTimeout(() => setIsLoading(false), 1000); // Simulate API call
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-md border-border/50 shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tighter text-center">Bem-vindo de Volta</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Acesse sua conta Phantom Shield.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input/50 border-border/50 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-input/50 border-border/50 focus:border-primary"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-4">
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <Link to="/Cadastro" className="font-medium text-primary hover:underline">
                Cadastre-se
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
      <footer className="mt-8 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Phantom Shield. Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default LoginPage;