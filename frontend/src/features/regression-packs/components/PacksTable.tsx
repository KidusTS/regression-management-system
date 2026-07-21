"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeletePack } from "../hooks/usePack.mutations";
import type { RegressionPack } from "../types/pack.types";

interface Props {
  packs: RegressionPack[];
  onEdit: (pack: RegressionPack) => void;
}

export function PacksTable({ packs, onEdit }: Props) {
  const { mutate: deletePack } = useDeletePack();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Versions</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {packs.map((pack) => (
          <TableRow key={pack.id}>
            <TableCell>
              <Link href={`/regression-packs/${pack.id}`} className="font-medium hover:underline">
                {pack.name}
              </Link>
              {pack.description && (
                <p className="text-muted-foreground text-xs">{pack.description}</p>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">{pack.project ?? "—"}</TableCell>
            <TableCell>{pack.versionCount}</TableCell>
            <TableCell>
              <Badge variant={pack.isActive ? "default" : "secondary"}>
                {pack.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(pack)}>
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm(`Delete "${pack.name}"?`)) deletePack(pack.id);
                  }}
                >
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
