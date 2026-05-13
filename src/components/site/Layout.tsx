import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { TrustStrip } from "./TrustStrip";
import { BottomNav } from "./BottomNav";

export function Layout({ children, hideTrust = false }: { children: ReactNode; hideTrust?: boolean }) {
  return (
    <div className="flex min-h-screen min-w-0 flex-col bg-background">
      <Header />
      <main className="min-w-0 flex-1 pb-16 lg:pb-0">{children}</main>
      {!hideTrust && <TrustStrip />}
      <Footer />
      <BottomNav />
    </div>
  );
}
