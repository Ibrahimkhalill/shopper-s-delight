import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";

export const Route = createFileRoute("/signup")({ component: SignupPage });

function SignupPage() {
  return (
    <Layout hideTrust>
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Create account</h1>
        <p className="text-sm text-muted-foreground mt-2">Shop faster, track orders, save favourites.</p>
        <form className="mt-8 space-y-3">
          <input placeholder="Full name" className="w-full h-12 px-5 rounded-full border bg-card text-sm outline-none focus:border-foreground" />
          <input placeholder="Phone number" className="w-full h-12 px-5 rounded-full border bg-card text-sm outline-none focus:border-foreground" />
          <input type="password" placeholder="Password" className="w-full h-12 px-5 rounded-full border bg-card text-sm outline-none focus:border-foreground" />
          <button className="w-full h-12 rounded-full bg-accent text-accent-foreground text-sm font-medium">Create account</button>
        </form>
        <p className="mt-5 text-sm text-muted-foreground text-center">
          Already have an account? <Link to="/login" className="text-accent font-medium">Sign in</Link>
        </p>
      </div>
    </Layout>
  );
}