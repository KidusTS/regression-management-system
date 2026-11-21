"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Download, Eye, EyeOff, FileSpreadsheet, Upload, XCircle } from "lucide-react";
import { usePackDetail } from "@/features/regression-packs/hooks/usePackDetail";
import { usePackVersions } from "@/features/regression-packs/hooks/usePackVersions";
import { usePackVersionTests } from "@/features/regression-packs/hooks/usePackVersionTests";
import { useExportVersion } from "@/features/regression-packs/hooks/usePack.mutations";
import { ImportPackModal } from "@/features/regression-packs/components/ImportPackModal";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { SearchInput } from "@/components/shared/SearchInput";
import { Skeleton, TableSkeleton } from "@/components/shared/Skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { RegressionPackVersion } from "@/features/regression-packs/types/pack.types";

const CHANGE_TONE: Record<string, string> = {
  ADDED: "bg-success-soft text-success",
  MODIFIED: "bg-warning-soft text-warning",
  REMOVED: "bg-danger-soft text-danger",
};

const PRIORITY_TONE: Record<string, string> = {
  CRITICAL: "bg-danger-soft text-danger",
  HIGH: "bg-warning-soft text-warning",
  MEDIUM: "bg-info-soft text-info",
  LOW: "bg-neutral-soft text-neutral",
};

function Chip({ children, tone = "bg-neutral-soft text-neutral" }: { children: React.ReactNode; tone?: string }) {
  return <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", tone)}>{children}</span>;
}

export default function PackDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: pack, isLoading: packLoading } = usePackDetail(id);
  const { data: versions, isLoading: versionsLoading } = usePackVersions(id);
  const [selected, setSelected] = useState<RegressionPackVersion | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { mutate: exportVersion, isPending: exporting } = useExportVersion(id);
  const { data: tests, isLoading: testsLoading } = usePackVersionTests(id, selected?.id ?? "");

  const filteredTests = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (tests ?? []).filter((t) => !q || [t.testIdRef, t.title, t.module, t.feature].some((v) => v?.toLowerCase().includes(q)));
  }, [tests, query]);

  if (packLoading) return <div className="space-y-4"><Skeleton className="h-9 w-72" /><TableSkeleton rows={3} /></div>;
  if (!pack) return <EmptyState icon={XCircle} title="Pack not found" description="It may have been deleted." />;

  const nextVersionNumber = (versions?.length ?? 0) + 1;
  const sortedVersions = [...(versions ?? [])].sort((a, b) => b.versionNumber - a.versionNumber);

  return (
    <>
      <PageHeader
        back={{ href: "/regression-packs", label: "All packs" }}
        title={pack.name}
        description={pack.description ?? undefined}
        meta={
          <>
            {pack.project && <span>{pack.project}</span>}
            <span>{pack.versionCount} {pack.versionCount === 1 ? "version" : "versions"}</span>
            {!pack.isActive && <Chip>Inactive</Chip>}
          </>
        }
        actions={<Button onClick={() => setImportOpen(true)}><Upload aria-hidden /> Import new version</Button>}
      />

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Versions</h2>
          <p className="text-muted-foreground text-sm">Each Excel import creates a new version and is compared with the previous one.</p>
        </div>

        {versionsLoading && <TableSkeleton rows={3} />}
        {versions && versions.length === 0 && (
          <EmptyState
            icon={FileSpreadsheet}
            title="No versions yet"
            description="Import an Excel file to create version 1 of this pack."
            action={<Button onClick={() => setImportOpen(true)}><Upload aria-hidden /> Import Excel file</Button>}
          />
        )}
        {sortedVersions.length > 0 && (
          <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Source file</TableHead>
                  <TableHead>Tests</TableHead>
                  <TableHead>Imported</TableHead>
                  <TableHead className="text-right"><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedVersions.map((v, i) => {
                  const open = selected?.id === v.id;
                  return (
                    <TableRow key={v.id} className={cn(open && "bg-accent/50")}>
                      <TableCell className="font-medium">
                        v{v.versionNumber} {i === 0 && <Chip tone="bg-accent text-accent-foreground">Latest</Chip>}
                        {v.label && <p className="text-muted-foreground text-xs font-normal">{v.label}</p>}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{v.sourceFileName ?? "—"}</TableCell>
                      <TableCell className="tabular-nums">{v.testCount}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{new Date(v.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button variant={open ? "secondary" : "outline"} size="sm" onClick={() => { setSelected(open ? null : v); setQuery(""); }}>
                            {open ? <EyeOff aria-hidden /> : <Eye aria-hidden />} {open ? "Hide tests" : "View tests"}
                          </Button>
                          <Button
                            variant="outline" size="sm" disabled={exporting}
                            onClick={() => exportVersion({ versionId: v.id, fileName: `${pack.name}-v${v.versionNumber}.xlsx` })}
                          >
                            <Download aria-hidden /> Export
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {selected && (
        <section className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">
              Tests in v{selected.versionNumber}{" "}
              <span className="text-muted-foreground text-sm font-normal">{filteredTests.length}{tests && filteredTests.length !== tests.length ? ` of ${tests.length}` : ""}</span>
            </h2>
            <SearchInput value={query} onChange={setQuery} placeholder="Search tests…" className="sm:w-64" />
          </div>
          {testsLoading && <TableSkeleton />}
          {tests && filteredTests.length === 0 && <p className="text-muted-foreground bg-card rounded-xl border px-4 py-10 text-center text-sm">No tests found.</p>}
          {filteredTests.length > 0 && (
            <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Test</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTests.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">{t.testIdRef}</TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm font-medium">{t.title}</p>
                        {(t.module || t.feature) && <p className="text-muted-foreground text-xs">{[t.module, t.feature].filter(Boolean).join(" › ")}</p>}
                      </TableCell>
                      <TableCell><Chip tone={PRIORITY_TONE[t.priority?.toUpperCase()]}>{t.priority}</Chip></TableCell>
                      <TableCell><Chip>{t.status}</Chip></TableCell>
                      <TableCell>{CHANGE_TONE[t.changeType] ? <Chip tone={CHANGE_TONE[t.changeType]}>{t.changeType}</Chip> : <span className="text-muted-foreground text-xs">—</span>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      )}

      <ImportPackModal packId={id} packName={pack.name} nextVersionNumber={nextVersionNumber} open={importOpen} onClose={() => setImportOpen(false)} />
    </>
  );
}
