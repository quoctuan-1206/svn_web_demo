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

/** Chỉ load pdfmake khi xuất PDF — tránh làm hỏng toàn bộ app lúc khởi động. */
let pdfMakePromise = null;

async function getPdfMake() {
  if (!pdfMakePromise) {
    pdfMakePromise = (async () => {
      let pdfMakeMod;
      try {
        pdfMakeMod = await import("pdfmake/build/pdfmake.min.js");
      } catch {
        pdfMakeMod = await import("pdfmake/build/pdfmake");
      }
      const pdfMake = pdfMakeMod.default ?? pdfMakeMod;

      let vfsMod;
      try {
        vfsMod = await import("pdfmake/build/vfs_fonts.js");
      } catch {
        vfsMod = await import("pdfmake/build/vfs_fonts");
      }

      const vfs =
        vfsMod?.pdfMake?.vfs ||
        vfsMod?.default?.pdfMake?.vfs ||
        vfsMod?.default?.vfs ||
        vfsMod?.vfs;

      if (vfs && pdfMake?.vfs !== vfs) {
        pdfMake.vfs = vfs;
      }

      if (typeof globalThis !== "undefined" && !globalThis.pdfMake) {
        globalThis.pdfMake = pdfMake;
      }
      return pdfMake;
    })();
  }
  return pdfMakePromise;
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

  const bodyBlocks = htmlToPdfBlocks(doc.body);
  const hasText =
    doc.title ||
    doc.excerpt ||
    bodyBlocks.some((b) => String(b.text || "").trim());

  if (!hasText) throw new Error("Nội dung PDF trống.");

  const pdfMake = await getPdfMake();
  if (!pdfMake?.createPdf) {
    throw new Error("Không khởi tạo được pdfmake.");
  }

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
      { text: "svn-automation.com", style: "site" },
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
        text: "© SVN Automation — Tài liệu văn bản xuất từ website",
        style: "footer",
      },
    ],
  };

  return new Promise((resolve, reject) => {
    try {
      pdfMake.createPdf(definition).download(doc.filename);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}
