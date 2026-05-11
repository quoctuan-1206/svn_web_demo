import { useMemo, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import styles from "./NewsRichEditor.module.css";

/**
 * Soạn thảo HTML cho nội dung tin (kiểu Word cơ bản).
 * Ảnh: nút ảnh mở chọn file — upload qua `uploadImages` rồi chèn vào nội dung.
 */
export default function NewsRichEditor({
  value,
  onChange,
  disabled,
  uploadImages,
  listImages,
  deleteImages,
}) {
  const quillRef = useRef(null);
  const editorImageInputRef = useRef(null);

  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryTab, setLibraryTab] = useState("library");
  const [libraryItems, setLibraryItems] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState("");
  const [selectedUrls, setSelectedUrls] = useState([]);
  const [uploading, setUploading] = useState(false);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ align: [] }],
          ["link", "image"],
          [{ color: [] }, { background: [] }],
          ["blockquote", "code-block"],
          ["clean"],
        ],
        handlers: {
          image() {
            if (!listImages) {
              if (!uploadImages) {
                window.alert("Chưa cấu hình tải ảnh.");
                return;
              }
              editorImageInputRef.current?.click();
              return;
            }
            setShowLibrary(true);
            setLibraryTab("library");
            setLibraryError("");
            setSelectedUrls([]);
            loadLibrary();
          },
        },
      },
    }),
    [listImages, uploadImages],
  );

  async function handleEditorImageFiles(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length || !uploadImages) return;
    setUploading(true);
    try {
      const urls = await uploadImages(files);
      const quill = quillRef.current?.getEditor?.();
      if (!quill || !urls.length) return;
      const range = quill.getSelection(true);
      let index = range ? range.index : quill.getLength();
      for (const url of urls) {
        quill.insertEmbed(index, "image", url, "user");
        index += 1;
      }
      quill.setSelection(index, 0);
    } catch (err) {
      window.alert(err?.message || "Tải ảnh thất bại");
    } finally {
      setUploading(false);
    }
  }

  async function loadLibrary() {
    if (!listImages) {
      setLibraryError("Chưa cấu hình thư viện ảnh.");
      return;
    }
    setLibraryLoading(true);
    setLibraryError("");
    try {
      const items = await listImages();
      setLibraryItems(Array.isArray(items) ? items : []);
    } catch (err) {
      setLibraryError(err?.message || "Không tải được thư viện ảnh");
    } finally {
      setLibraryLoading(false);
    }
  }

  function toggleSelected(url) {
    setSelectedUrls((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url],
    );
  }

  function insertSelectedImages() {
    if (!selectedUrls.length) return;
    const quill = quillRef.current?.getEditor?.();
    if (!quill) return;
    const range = quill.getSelection(true);
    let index = range ? range.index : quill.getLength();
    selectedUrls.forEach((url) => {
      quill.insertEmbed(index, "image", url, "user");
      index += 1;
    });
    quill.setSelection(index, 0);
    setShowLibrary(false);
  }

  async function handleLibraryUpload(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length || !uploadImages) return;
    setLibraryError("");
    setUploading(true);
    try {
      const urls = await uploadImages(files);
      setSelectedUrls((prev) => Array.from(new Set([...prev, ...urls])));
      await loadLibrary();
      setLibraryTab("library");
    } catch (err) {
      setLibraryError(err?.message || "Tải ảnh thất bại");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteSelected() {
    if (!deleteImages || !selectedUrls.length) return;
    const ok = window.confirm(`Xóa ${selectedUrls.length} ảnh đã chọn?`);
    if (!ok) return;
    setLibraryError("");
    try {
      await deleteImages(selectedUrls);
      setSelectedUrls([]);
      await loadLibrary();
    } catch (err) {
      setLibraryError(err?.message || "Xóa ảnh thất bại");
    }
  }

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "indent",
    "align",
    "link",
    "image",
    "color",
    "background",
    "blockquote",
    "code-block",
  ];

  return (
    <div className={styles.wrap}>
      <input
        ref={editorImageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        aria-hidden
        tabIndex={-1}
        className="sr-only"
        onChange={handleEditorImageFiles}
      />
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value || ""}
        onChange={onChange}
        modules={modules}
        formats={formats}
        readOnly={disabled}
        placeholder="Soạn nội dung: định dạng chữ, danh sách, căn lề, chèn link; ảnh trong bài — bấm biểu tượng ảnh rồi chọn file..."
      />

      {showLibrary ? (
        <div className={styles.overlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.modalTitle}>Thư viện ảnh</div>
                <div className={styles.modalSub}>
                  Chọn ảnh để chèn vào nội dung
                </div>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setShowLibrary(false)}
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            <div className={styles.tabRow}>
              <button
                type="button"
                className={
                  libraryTab === "library" ? styles.tabActive : styles.tabBtn
                }
                onClick={() => setLibraryTab("library")}
              >
                Thư viện
              </button>
              <button
                type="button"
                className={
                  libraryTab === "upload" ? styles.tabActive : styles.tabBtn
                }
                onClick={() => setLibraryTab("upload")}
              >
                Tải lên
              </button>
            </div>

            {libraryError ? (
              <div className={styles.errorBox}>{libraryError}</div>
            ) : null}

            {libraryTab === "upload" ? (
              <div className={styles.uploadPane}>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={uploading}
                  onChange={handleLibraryUpload}
                  className={styles.uploadInput}
                />
                <div className={styles.uploadHint}>
                  {uploading
                    ? "Đang tải lên..."
                    : "Upload nhiều ảnh để chọn và chèn vào nội dung. (Tối đa 5MB/ảnh, định dạng JPG/PNG/WEBP)"}
                </div>
              </div>
            ) : (
              <div className={styles.libraryPane}>
                <div className={styles.libraryActions}>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={loadLibrary}
                    disabled={libraryLoading}
                  >
                    {libraryLoading ? "Đang tải..." : "Làm mới"}
                  </button>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={() => setLibraryTab("upload")}
                    disabled={!uploadImages}
                  >
                    + Tải ảnh
                  </button>
                  <button
                    type="button"
                    className={styles.dangerBtn}
                    onClick={handleDeleteSelected}
                    disabled={!deleteImages || !selectedUrls.length}
                  >
                    Xóa đã chọn
                  </button>
                </div>

                <div className={styles.grid}>
                  {libraryLoading ? (
                    <div className={styles.emptyState}>Đang tải ảnh...</div>
                  ) : libraryItems.length ? (
                    libraryItems.map((item) => (
                      <button
                        key={item.url}
                        type="button"
                        className={
                          selectedUrls.includes(item.url)
                            ? styles.cardSelected
                            : styles.card
                        }
                        onClick={() => toggleSelected(item.url)}
                        title={item.name || item.url}
                      >
                        <img
                          src={item.url}
                          alt={item.name || "upload"}
                          className={styles.thumb}
                        />
                      </button>
                    ))
                  ) : (
                    <div className={styles.emptyState}>Chưa có ảnh nào</div>
                  )}
                </div>
              </div>
            )}

            <div className={styles.footerRow}>
              <div className={styles.selectionHint}>
                Đã chọn {selectedUrls.length} ảnh
              </div>
              <div className={styles.footerActions}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => setShowLibrary(false)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={insertSelectedImages}
                  disabled={!selectedUrls.length}
                >
                  Chèn vào nội dung
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
