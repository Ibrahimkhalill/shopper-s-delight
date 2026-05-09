import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { TrustStrip } from "./TrustStrip";
import { BottomNav } from "./BottomNav";

export function Layout({ children, hideTrust = false }: { children: ReactNode; hideTrust?: boolean }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      {!hideTrust && <TrustStrip />}
      <Footer />
      <BottomNav />
    </div>
  );
}
