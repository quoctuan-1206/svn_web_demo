import i18n from "../i18n";
import { htmlToPdfBlocks } from "./htmlToPdfBlocks";

const PDF_STYLES = {
  brand: { fontSize: 14, bold: true, color: "#0a0a0a" },
  site: { fontSize: 9, color: "#64748b" },
  eyebrow: {
    fontSize: 9,
    bold: true,
    color: "#00a152",
    characterSpacing: 1.2,
    margin: [0, 4, 0, 0],
  },
  title: { fontSize: 20, bold: true, margin: [0, 10, 0, 8] },
  date: { fontSize: 10, color: "#64748b", margin: [0, 0, 0, 12] },
  excerpt: {
    fontSize: 11,
    italics: true,
    color: "#334155",
    margin: [0, 0, 0, 16],
  },
  heading: { fontSize: 13, bold: true, color: "#0f172a" },
  body: { fontSize: 11, lineHeight: 1.4, color: "#1e293b" },
  quote: { fontSize: 11, italics: true, color: "#475569" },
  caption: { fontSize: 9, color: "#64748b" },
  footer: {
    fontSize: 8,
    color: "#94a3b8",
    margin: [0, 28, 0, 0],
  },
  hr: { margin: [0, 16, 0, 16] },
};

let pdfMakePromise = null;

async function loadPdfMake() {
  const pdfMakeModule = await import("pdfmake/build/pdfmake.min.js");
  const pdfMake = pdfMakeModule.default ?? pdfMakeModule;

  if (typeof globalThis !== "undefined") {
    globalThis.pdfMake = pdfMake;
  }

  const vfsModule = await import("pdfmake/build/vfs_fonts.js");
  const vfs = vfsModule.default ?? vfsModule.pdfMake?.vfs ?? vfsModule;

  if (typeof pdfMake.addVirtualFileSystem === "function" && vfs) {
    pdfMake.addVirtualFileSystem(vfs);
  } else if (vfs) {
    pdfMake.vfs = vfs;
  }

  try {
    await import("pdfmake/build/fonts/Roboto.js");
  } catch {
    /* Roboto đã đăng ký qua vfs */
  }

  if (!pdfMake.createPdf) {
    throw new Error("Thư viện PDF chưa sẵn sàng.");
  }

  return pdfMake;
}

async function getPdfMake() {
  if (!pdfMakePromise) {
    pdfMakePromise = loadPdfMake();
  }
  return pdfMakePromise;
}

function triggerBrowserDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * @param {{
 *   filename: string,
 *   typeLabel: string,
 *   title: string,
 *   date?: string,
 *   excerpt?: string,
 *   body?: string,
 * }} doc
 * @returns {Promise<void>}
 */
export async function exportContentPdf(doc) {
  if (!doc?.title) throw new Error("Thiếu nội dung PDF.");

  const bodyBlocks = await htmlToPdfBlocks(doc.body);
  const hasText =
    doc.title ||
    doc.excerpt ||
    bodyBlocks.some((b) => String(b.text || "").trim());

  if (!hasText) throw new Error("Nội dung PDF trống.");

  const pdfMake = await getPdfMake();

  const definition = {
    pageSize: "A4",
    pageMargins: [48, 56, 48, 56],
    defaultStyle: {
      font: "Roboto",
      fontSize: 11,
      color: "#0f172a",
    },
    styles: PDF_STYLES,
    content: [
      { text: "SVN Automation", style: "brand" },
      { text: i18n.t("pdf.brandSite"), style: "site" },
      { text: doc.typeLabel, style: "eyebrow" },
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 1,
            lineColor: "#00e676",
          },
        ],
        style: "hr",
      },
      { text: doc.title, style: "title" },
      ...(doc.date ? [{ text: doc.date, style: "date" }] : []),
      ...(doc.excerpt ? [{ text: doc.excerpt, style: "excerpt" }] : []),
      ...bodyBlocks,
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 0.5,
            lineColor: "#e2e8f0",
          },
        ],
        margin: [0, 20, 0, 8],
      },
      {
        text: i18n.t("pdf.footer"),
        style: "footer",
      },
    ],
  };

  const pdfDoc = pdfMake.createPdf(definition);

  if (typeof pdfDoc.getBlob === "function") {
    const blob = await pdfDoc.getBlob();
    triggerBrowserDownload(blob, doc.filename);
    return;
  }

  return new Promise((resolve, reject) => {
    try {
      pdfDoc.download(
        doc.filename,
        () => resolve(),
        (err) => reject(err ?? new Error("Tải PDF thất bại.")),
      );
    } catch (err) {
      reject(err);
    }
  });
}
