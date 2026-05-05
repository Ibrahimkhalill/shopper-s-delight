import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  return (
    <Layout hideTrust>
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground mt-2">Welcome back to SHOP.BD</p>
        <form className="mt-8 space-y-3">
          <input placeholder="Phone or email" className="w-full h-12 px-5 rounded-full border bg-card text-sm outline-none focus:border-foreground" />
          <input type="password" placeholder="Password" className="w-full h-12 px-5 rounded-full border bg-card text-sm outline-none focus:border-foreground" />
          <button className="w-full h-12 rounded-full bg-foreground text-background text-sm font-medium">Sign in</button>
        </form>
        <p className="mt-5 text-sm text-muted-foreground text-center">
          New here? <Link to="/signup" className="text-accent font-medium">Create an account</Link>
        </p>
      </div>
    </Layout>
  );
}