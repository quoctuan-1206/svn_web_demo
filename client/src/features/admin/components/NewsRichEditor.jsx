import { useMemo, useRef } from "react";
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
}) {
  const quillRef = useRef(null);
  const editorImageInputRef = useRef(null);

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
            if (!uploadImages) {
              window.alert("Chưa cấu hình tải ảnh.");
              return;
            }
            editorImageInputRef.current?.click();
          },
        },
      },
    }),
    [uploadImages],
  );

  async function handleEditorImageFiles(e) {
    const files = e.target.files;
    e.target.value = "";
    if (!files?.length || !uploadImages) return;
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
    </div>
  );
}
