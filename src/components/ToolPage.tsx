import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function ToolPage({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <header className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
          <Icon className="size-5" aria-hidden />
        </span>
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </header>
      {children}
    </div>
  );
}

export function InputPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="surface-card flex flex-col gap-4 p-4 sm:p-5">
      <h2 className="text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}
