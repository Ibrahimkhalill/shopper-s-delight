"use client";

import Link from "next/link";
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

/* Amazon/Apple-aligned page header scale.
 *   crumbs   → 12px
 *   title    → 20px mobile / 24px desktop (max heading)
 *   subtitle → 13px mobile / 14px desktop
 */
const crumbNav =
  "flex items-center gap-1.5 text-xs leading-none text-muted-foreground flex-wrap";

const pageTitleCentered =
  "text-[1.25rem] font-bold leading-tight tracking-tight text-balance sm:text-[1.375rem] lg:text-2xl";

const pageTitleDefault =
  "text-[1.125rem] font-bold leading-tight tracking-tight text-balance sm:text-[1.25rem] lg:text-2xl";

const subtitleClass =
  "text-[13px] text-muted-foreground leading-relaxed text-pretty lg:text-sm lg:leading-[1.5]";

export function PageHeader({ title, subtitle, crumbs, actions, badge, centered }: PageHeaderProps) {
  if (centered) {
    return (
      <div className="bg-gradient-to-b from-secondary/60 to-background">
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-6 text-center sm:pt-7 sm:pb-7 lg:pt-10 lg:pb-9">
          {crumbs && crumbs.length > 0 && (
            <nav className={`${crumbNav} justify-center mb-3 lg:mb-4`}>
              {crumbs.map((c, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="size-3 shrink-0 opacity-60" />}
                  {c.to ? (
                    <Link href={c.to} className="hover:text-foreground transition-colors">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="text-foreground font-medium">{c.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          {badge && <div className="mb-3 flex justify-center">{badge}</div>}
          <h1 className={pageTitleCentered}>{title}</h1>
          {subtitle && (
            <p className={`mx-auto mt-2 max-w-md ${subtitleClass} lg:mt-3 lg:max-w-xl`}>
              {subtitle}
            </p>
          )}
          {actions && (
            <div className="mt-4 flex items-center justify-center gap-2 flex-wrap lg:mt-5 lg:gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-border/80 bg-gradient-to-b from-secondary/50 to-background">
      <div className="mx-auto max-w-7xl px-4 pt-5 pb-4 sm:pt-6 sm:pb-5 lg:pt-8 lg:pb-7">
        {crumbs && crumbs.length > 0 && (
          <nav className={`${crumbNav} mb-2.5 lg:mb-3`}>
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="size-3 shrink-0 opacity-60" />}
                {c.to ? (
                  <Link href={c.to} className="hover:text-foreground transition-colors">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        <div className="flex items-end justify-between gap-4 flex-wrap lg:gap-6">
          <div className="min-w-0">
            {badge && <div className="mb-2">{badge}</div>}
            <h1 className={pageTitleDefault}>{title}</h1>
            {subtitle && (
              <p className={`mt-1.5 max-w-xl ${subtitleClass} lg:mt-2 lg:max-w-2xl`}>
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0 flex-wrap lg:gap-3">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
