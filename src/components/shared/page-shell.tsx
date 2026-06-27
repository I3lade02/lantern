import { SectionTitle } from "@/components/ui/section-title";

type PageShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: string;
  children: React.ReactNode;
};

export function PageShell({
  eyebrow,
  title,
  description,
  action,
  children,
}: PageShellProps) {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8 sm:py-10">
      <SectionTitle
        action={action}
        description={description}
        eyebrow={eyebrow}
        title={title}
      />

      <div className="mt-8">{children}</div>
    </main>
  );
}