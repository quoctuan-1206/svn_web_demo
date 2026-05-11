import styles from "./NewsDetailPage.module.css";

/** HTML có thẻ nội dung (kể cả ảnh lồng trong đoạn) */
function looksLikeHtmlFragment(c) {
  if (/^</.test(c)) return true;
  return /<(img|p|div|figure|picture|h[1-6]|ul|ol|li|br|blockquote|section|article|span|strong|em|a|table|thead|tbody|tr|td|th)\b/i.test(
    c,
  );
}

const MD_IMG = /^!\[([^\]]*)\]\(([^)]+)\)$/;

function isStandaloneImageUrl(line) {
  const t = line.trim();
  if (!/^https?:\/\/\S+$/i.test(t)) return false;
  return /\.(jpe?g|png|gif|webp|svg)(\?[^\s]*)?$/i.test(t);
}

function PlainArticleBody({ content }) {
  const lines = String(content || "").split("\n");
  const nodes = [];
  let textBuf = [];

  function flushText() {
    if (!textBuf.length) return;
    const joined = textBuf.join("\n");
    textBuf = [];
    nodes.push(
      <p key={`t-${nodes.length}`} className={styles.plainPara}>
        {joined}
      </p>,
    );
  }

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    const md = MD_IMG.exec(line.trim());
    if (md) {
      flushText();
      const src = md[2].trim();
      const alt = md[1] || "";
      nodes.push(
        <figure key={`img-${idx}`} className={styles.inlineFigure}>
          <img src={src} alt={alt} className={styles.inlineImg} loading="lazy" />
        </figure>,
      );
      return;
    }
    if (isStandaloneImageUrl(line)) {
      flushText();
      nodes.push(
        <figure key={`img-${idx}`} className={styles.inlineFigure}>
          <img
            src={trimmed}
            alt=""
            className={styles.inlineImg}
            loading="lazy"
          />
        </figure>,
      );
      return;
    }
    if (trimmed === "") {
      flushText();
      return;
    }
    textBuf.push(line);
  });
  flushText();

  return <div className={styles.plainBody}>{nodes}</div>;
}

export function ArticleBody({ content }) {
  const c = String(content || "").trim();
  if (!c) {
    return <p className={styles.emptyBody}>Nội dung đang được cập nhật.</p>;
  }
  if (looksLikeHtmlFragment(c)) {
    return (
      <div
        className={styles.htmlBody}
        dangerouslySetInnerHTML={{ __html: c }}
      />
    );
  }
  return <PlainArticleBody content={c} />;
}
