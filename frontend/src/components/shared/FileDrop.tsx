"use client";

import { useDropzone } from "react-dropzone";
import { FileSpreadsheet, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function FileDrop({ file, onChange }: { file: File | null; onChange: (f: File | null) => void }) {
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    accept: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"] },
    multiple: false,
    onDropAccepted: (files) => onChange(files[0] ?? null),
  });

  if (file) {
    return (
      <div className="bg-muted/50 flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm">
        <FileSpreadsheet className="text-success size-5 shrink-0" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{file.name}</p>
          <p className="text-muted-foreground text-xs">{(file.size / 1024).toFixed(1)} KB</p>
        </div>
        <button type="button" onClick={() => onChange(null)} aria-label="Remove file" className="text-muted-foreground hover:text-foreground rounded-md p-1.5">
          <X className="size-4" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors",
          isDragActive ? "border-primary bg-accent" : "hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        <input {...getInputProps()} aria-label="Excel file" />
        <UploadCloud className="text-muted-foreground size-6" aria-hidden />
        <p className="text-sm font-medium">{isDragActive ? "Drop the file here" : "Drag & drop or click to browse"}</p>
        <p className="text-muted-foreground text-xs">Excel workbook (.xlsx)</p>
      </div>
      {fileRejections.length > 0 && <p role="alert" className="text-destructive mt-1.5 text-xs">Only .xlsx files are supported.</p>}
    </div>
  );
}
