import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

type Crumb = { label: string; to?: string };

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
  actions?: ReactNode;
  badge?: ReactNode;
  centered?: boolean;
}

export function PageHeader({ title, subtitle, crumbs, actions, badge, centered }: PageHeaderProps) {
  if (centered) {
    return (
      <div className="border-b bg-linear-to-b from-secondary/50 to-background">
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-7 text-center">
          {crumbs && crumbs.length > 0 && (
            <nav className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-4 flex-wrap">
              {crumbs.map((c, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="size-3" />}
                  {c.to ? (
                    <Link to={c.to} className="hover:text-foreground transition">{c.label}</Link>
                  ) : (
                    <span className="text-foreground font-medium">{c.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          {badge && <div className="mb-3 flex justify-center">{badge}</div>}
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">{subtitle}</p>}
          {actions && <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">{actions}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="border-b bg-linear-to-b from-secondary/50 to-background">
      <div className="mx-auto max-w-7xl px-4 pt-6 pb-5">
        {crumbs && crumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 flex-wrap">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="size-3" />}
                {c.to ? (
                  <Link to={c.to} className="hover:text-foreground transition">{c.label}</Link>
                ) : (
                  <span className="text-foreground font-medium">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            {badge && <div className="mb-2">{badge}</div>}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0 flex-wrap">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
