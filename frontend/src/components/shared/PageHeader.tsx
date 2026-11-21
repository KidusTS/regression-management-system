import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
  meta?: React.ReactNode;
}

export function PageHeader({ title, description, actions, back, meta }: Props) {
  return (
    <header className="space-y-3">
      {back && (
        <Link href={back.href} className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors">
          <ArrowLeft className="size-4" aria-hidden /> {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">{title}</h1>
          {meta && <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">{meta}</div>}
          {description && <p className="text-muted-foreground max-w-2xl text-sm">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
