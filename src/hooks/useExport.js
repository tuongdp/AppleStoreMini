import { useState, useCallback } from "react";
import { exportToExcel, exportToPDF, exportDashboardPDF } from "@/utils/exportUtils";
import { toast } from "sonner";

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async (fn, config) => {
    setIsExporting(true);
    try {
      await fn(config);
    } catch (err) {
      console.error("Export failed:", err);
      toast.error(err?.message || "Xuất file thất bại, vui lòng thử lại");
    } finally {
      setIsExporting(false);
    }
  }, []);

  const exportExcel = useCallback((config) => handleExport(exportToExcel, config), [handleExport]);
  const exportPDF = useCallback((config) => handleExport(exportToPDF, config), [handleExport]);
  const exportDashboardPDFFn = useCallback((config) => handleExport(exportDashboardPDF, config), [handleExport]);

  return { exportExcel, exportPDF, exportDashboardPDF: exportDashboardPDFFn, isExporting };
}
