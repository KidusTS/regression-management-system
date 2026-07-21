"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { usePackDetail } from "@/features/regression-packs/hooks/usePackDetail";
import { usePackVersions } from "@/features/regression-packs/hooks/usePackVersions";
import { usePackVersionTests } from "@/features/regression-packs/hooks/usePackVersionTests";
import { useExportVersion } from "@/features/regression-packs/hooks/usePack.mutations";
import { ImportPackModal } from "@/features/regression-packs/components/ImportPackModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RegressionPackVersion } from "@/features/regression-packs/types/pack.types";

export default function PackDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: pack, isLoading: packLoading } = usePackDetail(id);
  const { data: versions, isLoading: versionsLoading } = usePackVersions(id);
  const [selectedVersion, setSelectedVersion] = useState<RegressionPackVersion | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const { mutate: exportVersion, isPending: exporting } = useExportVersion(id);

  const nextVersionNumber = (versions?.length ?? 0) + 1;

  const { data: tests, isLoading: testsLoading } = usePackVersionTests(
    id,
    selectedVersion?.id ?? ""
  );

  if (packLoading) return <p className="text-muted-foreground text-sm">Loading...</p>;
  if (!pack) return <p className="text-destructive text-sm">Pack not found.</p>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{pack.name}</h1>
          <div className="mt-1 flex items-center gap-3">
            {pack.project && <span className="text-muted-foreground text-sm">{pack.project}</span>}
            <Badge variant={pack.isActive ? "default" : "secondary"}>
              {pack.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          {pack.description && (
            <p className="text-muted-foreground mt-2 text-sm">{pack.description}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button onClick={() => setImportOpen(true)}>Import New Version</Button>
          <p className="text-muted-foreground text-xs">
            Each import creates a new version
          </p>
        </div>
      </div>

      {/* Versions */}
      <div className="space-y-3">
        <div>
          <h2 className="font-medium">Versions</h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Versions are created by importing an Excel file. Each import snapshots the test cases at that point in time.
          </p>
        </div>
        {versionsLoading && <p className="text-muted-foreground text-sm">Loading versions...</p>}
        {versions && versions.length === 0 && (
          <p className="text-muted-foreground text-sm">No versions yet. Use "Import New Version" to create v1.</p>
        )}
        {versions && versions.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Tests</TableHead>
                <TableHead>Imported</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.map((v) => (
                <TableRow
                  key={v.id}
                  className={selectedVersion?.id === v.id ? "bg-muted/50" : ""}
                >
                  <TableCell className="font-medium">v{v.versionNumber}</TableCell>
                  <TableCell>{v.label ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{v.sourceFileName ?? "—"}</TableCell>
                  <TableCell>{v.testCount}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(v.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSelectedVersion(selectedVersion?.id === v.id ? null : v)
                        }
                      >
                        {selectedVersion?.id === v.id ? "Hide tests" : "View tests"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={exporting}
                        onClick={() =>
                          exportVersion({
                            versionId: v.id,
                            fileName: `${pack.name}-v${v.versionNumber}.xlsx`,
                          })
                        }
                      >
                        Export
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Tests for selected version */}
      {selectedVersion && (
        <div className="space-y-3">
          <h2 className="font-medium">
            Tests — v{selectedVersion.versionNumber}
          </h2>
          {testsLoading && <p className="text-muted-foreground text-sm">Loading tests...</p>}
          {tests && tests.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Feature</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">{t.testIdRef}</TableCell>
                      <TableCell className="text-sm">{t.module ?? "—"}</TableCell>
                      <TableCell className="text-sm">{t.feature ?? "—"}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm">{t.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{t.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{t.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            t.changeType === "ADDED"
                              ? "border-green-500 text-green-600"
                              : t.changeType === "MODIFIED"
                              ? "border-yellow-500 text-yellow-600"
                              : t.changeType === "REMOVED"
                              ? "border-red-500 text-red-600"
                              : ""
                          }`}
                        >
                          {t.changeType}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      <ImportPackModal
        packId={id}
        packName={pack.name}
        nextVersionNumber={nextVersionNumber}
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />
    </div>
  );
}
