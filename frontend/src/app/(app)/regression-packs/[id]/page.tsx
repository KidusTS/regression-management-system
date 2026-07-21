"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { usePackDetail } from "@/features/regression-packs/hooks/usePackDetail";
import { usePackVersions } from "@/features/regression-packs/hooks/usePackVersions";
import { usePackVersionTests } from "@/features/regression-packs/hooks/usePackVersionTests";
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
        <Button onClick={() => setImportOpen(true)}>Import Excel</Button>
      </div>

      {/* Versions */}
      <div className="space-y-3">
        <h2 className="font-medium">Versions</h2>
        {versionsLoading && <p className="text-muted-foreground text-sm">Loading versions...</p>}
        {versions && versions.length === 0 && (
          <p className="text-muted-foreground text-sm">No versions yet. Import an Excel file to create the first version.</p>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSelectedVersion(selectedVersion?.id === v.id ? null : v)
                      }
                    >
                      {selectedVersion?.id === v.id ? "Hide tests" : "View tests"}
                    </Button>
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
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />
    </div>
  );
}
