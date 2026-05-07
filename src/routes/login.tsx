import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { login } = useStore();
  const { t, lang } = useT();
  const navigate = useNavigate();
  const [identifier, setId] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !pw) { toast.error("Enter your phone/email and password"); return; }
    login({ name: identifier.includes("@") ? identifier.split("@")[0] : "Customer", phone: identifier, email: identifier.includes("@") ? identifier : undefined });
    toast.success("Welcome back!");
    navigate({ to: "/profile" });
  };

  return (
    <Layout hideTrust>
      <div className={`mx-auto max-w-md px-4 py-16 animate-fade-up ${lang === "bn" ? "font-bn" : ""}`}>
        <h1 className="text-3xl font-semibold tracking-tight">{t("user.signin")}</h1>
        <p className="text-sm text-muted-foreground mt-2">{t("user.welcome_back")}</p>
        <form onSubmit={submit} className="mt-8 space-y-3">
          <input value={identifier} onChange={(e) => setId(e.target.value)} placeholder={t("user.phone_or_email")} className="w-full h-12 px-5 rounded-full border bg-card text-sm outline-none focus:border-foreground transition" />
          <div className="relative">
            <input value={pw} onChange={(e) => setPw(e.target.value)} type={show ? "text" : "password"} placeholder={t("user.password")} className="w-full h-12 px-5 pr-12 rounded-full border bg-card text-sm outline-none focus:border-foreground transition" />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
          </div>
          <button className="w-full h-12 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition">{t("user.signin")}</button>
        </form>
        <p className="mt-5 text-sm text-muted-foreground text-center">
          {t("user.new_here")} <Link to="/signup" className="text-accent font-medium">{t("user.create")}</Link>
        </p>
      </div>
    </Layout>
  );
}
