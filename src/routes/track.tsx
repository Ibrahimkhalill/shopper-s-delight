import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";

export const Route = createFileRoute("/track")({ component: TrackPage });

function TrackPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-center">Track your order</h1>
        <p className="text-sm text-muted-foreground text-center mt-2">No login needed. Just your order ID and phone.</p>
        <form className="mt-8 space-y-3">
          <input placeholder="Order ID (e.g. BD-2026-00421)" className="w-full h-12 px-5 rounded-full border bg-card text-sm outline-none focus:border-foreground" />
          <input placeholder="Phone number" className="w-full h-12 px-5 rounded-full border bg-card text-sm outline-none focus:border-foreground" />
          <Link to="/order/$id" params={{ id: "BD-2026-00421" }} className="block text-center h-12 leading-[3rem] rounded-full bg-accent text-accent-foreground text-sm font-medium">Track order</Link>
        </form>
      </div>
    </Layout>
  );
}