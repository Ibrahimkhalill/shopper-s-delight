import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({ component: SignupPage });

function SignupPage() {
  const { login } = useStore();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pw, setPw] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !pw) { toast.error("Please fill all fields"); return; }
    login({ name, phone });
    toast.success("Account created", { description: `Welcome, ${name}!` });
    navigate({ to: "/profile" });
  };
  return (
    <Layout hideTrust>
      <div className="mx-auto max-w-md px-4 py-16 animate-fade-up">
        <h1 className="text-3xl font-semibold tracking-tight">Create account</h1>
        <p className="text-sm text-muted-foreground mt-2">Shop faster, track orders, save favourites.</p>
        <form onSubmit={submit} className="mt-8 space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full h-12 px-5 rounded-full border bg-card text-sm outline-none focus:border-foreground" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="w-full h-12 px-5 rounded-full border bg-card text-sm outline-none focus:border-foreground" />
          <input value={pw} onChange={(e) => setPw(e.target.value)} type="password" placeholder="Password" className="w-full h-12 px-5 rounded-full border bg-card text-sm outline-none focus:border-foreground" />
          <button className="w-full h-12 rounded-full bg-accent text-accent-foreground text-sm font-medium hover:opacity-90">Create account</button>
        </form>
        <p className="mt-5 text-sm text-muted-foreground text-center">
          Already have an account? <Link to="/login" className="text-accent font-medium">Sign in</Link>
        </p>
      </div>
    </Layout>
  );
}
