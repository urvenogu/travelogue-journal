import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Auth = () => {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/admin", { replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate("/admin", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "sign-up") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Account created. You're now signed in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin — Fourteen Days</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <main className="min-h-screen flex items-center justify-center px-5 py-14">
        <div className="w-full max-w-sm">
          <p className="eyebrow mb-3 text-center">Private</p>
          <h1 className="font-serif text-3xl text-center mb-1">Admin</h1>
          <p className="text-sm text-muted-foreground text-center mb-8">
            {mode === "sign-in" ? "Sign in to add entries." : "Create the admin account."}
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "…" : mode === "sign-in" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => setMode((m) => (m === "sign-in" ? "sign-up" : "sign-in"))}
            className="mt-6 w-full text-xs text-muted-foreground hover:text-foreground"
          >
            {mode === "sign-in"
              ? "First time here? Create the admin account →"
              : "Already have an account? Sign in →"}
          </button>

          <p className="mt-8 text-[11px] text-center text-muted-foreground leading-relaxed">
            The first account you create is automatically promoted to admin.
          </p>
        </div>
      </main>
    </>
  );
};

export default Auth;
