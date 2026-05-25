import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      const message =
        err instanceof Error && err.message
          ? err.message
          : t("common.pdfError");
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
        {busy ? t("common.generatingPdf") : t("common.downloadPdf")}
      </button>
      {error ? (
        <span className={styles.error} role="alert">
          {error}
        </span>
      ) : null}
    </span>
  );
}
