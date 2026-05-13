"use client";

import { I18nProvider } from "@/lib/i18n";
import { StoreProvider, useStore } from "@/lib/store";
import { Toaster } from "@/components/ui/sonner";
import { AuthModal } from "@/components/site/AuthModal";

function AppShell({ children }: { children: React.ReactNode }) {
  const { authModalOpen, authModalTab, closeAuthModal } = useStore();
  return (
    <>
      {children}
      <Toaster position="top-center" richColors />
      <AuthModal open={authModalOpen} onClose={closeAuthModal} defaultTab={authModalTab} />
    </>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <StoreProvider>
        <AppShell>{children}</AppShell>
      </StoreProvider>
    </I18nProvider>
  );
}
