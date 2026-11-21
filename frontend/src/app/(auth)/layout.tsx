import { FlaskConical, GitCompare, History, FileSpreadsheet } from "lucide-react";

const points = [
  { icon: FileSpreadsheet, text: "Import and export packs straight from Excel" },
  { icon: GitCompare, text: "Automatic version diffs: added, modified, removed" },
  { icon: History, text: "Every session preserved with full pass/fail history" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="bg-sidebar text-sidebar-foreground relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="bg-sidebar-primary text-sidebar-primary-foreground flex size-9 items-center justify-center rounded-lg">
            <FlaskConical className="size-5" aria-hidden />
          </span>
          <span className="text-sidebar-accent-foreground text-lg font-semibold">Regression Hub</span>
        </div>
        <div className="space-y-8">
          <h2 className="text-sidebar-accent-foreground max-w-md text-4xl leading-tight font-semibold tracking-tight text-balance">
            Regression testing, without the spreadsheet chaos.
          </h2>
          <ul className="space-y-4">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm">
                <span className="bg-sidebar-accent flex size-9 items-center justify-center rounded-lg"><Icon className="text-sidebar-primary size-4" aria-hidden /></span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sidebar-foreground/50 text-xs">Regression Management System</p>
        <div className="bg-sidebar-primary/20 pointer-events-none absolute -right-24 -bottom-24 size-80 rounded-full blur-3xl" />
      </div>
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
