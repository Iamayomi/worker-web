"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/utils/csv";

export type CsvRow = (string | number | null | undefined)[];

interface ExportCsvButtonProps {
  filename: string;
  headers: string[];
  rows?: CsvRow[];
  fetchAll?: () => Promise<CsvRow[]>;
  disabled?: boolean;
}

export function ExportCsvButton({
  filename,
  headers,
  rows,
  fetchAll,
  disabled,
}: ExportCsvButtonProps) {
  const [loading, setLoading] = useState(false);

  const hasRows = (rows?.length ?? 0) > 0;

  const handleClick = async () => {
    if (loading) return;
    try {
      if (fetchAll) {
        setLoading(true);
        const allRows = await fetchAll();
        downloadCsv(filename, headers, allRows);
      } else {
        downloadCsv(filename, headers, rows ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      disabled={disabled || loading || (!fetchAll && !hasRows)}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {loading ? "Exporting..." : "Export CSV"}
    </Button>
  );
}
