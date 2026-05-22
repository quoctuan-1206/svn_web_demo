import { useState } from "react";
import { Download } from "lucide-react";
import styles from "./PdfDownloadButton.module.css";
import { exportContentPdf } from "../../../utils/exportContentPdf";
import { fetchItemForPdf } from "../../../utils/fetchItemForPdf";
import {
  pdfPayloadFromNews,
  pdfPayloadFromProduct,
} from "../../../utils/pdfDocument";

/**
 * @param {{
 *   item: object,
 *   kind: "product" | "solution" | "news",
 *   className?: string,
 *   compact?: boolean,
 * }} props
 */
export default function PdfDownloadButton({
  item,
  kind,
  className = "",
  compact = false,
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    if (!item || busy) return;
    setError("");
    setBusy(true);
    try {
      const full = await fetchItemForPdf(item, kind);
      const doc =
        kind === "news"
          ? pdfPayloadFromNews(full)
          : pdfPayloadFromProduct(full, kind);
      await exportContentPdf(doc);
    } catch (err) {
      console.error("PDF export failed", err);
      const message = err?.message
        ? `Không tạo được PDF: ${err.message}`
        : "Không tạo được PDF. Thử lại.";
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className={`${styles.wrap} ${className}`.trim()}>
      <button
        type="button"
        className={`${styles.btn} ${compact ? styles.compact : ""}`}
        onClick={handleClick}
        disabled={busy}
        aria-busy={busy}
      >
        <Download size={compact ? 14 : 16} aria-hidden />
        {busy ? "Đang tạo PDF…" : "Tải PDF"}
      </button>
      {error ? (
        <span className={styles.error} role="alert">
          {error}
        </span>
      ) : null}
    </span>
  );
}
