import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Pencil, Trash2 } from "lucide-react";
import NewsRichEditor from "../components/NewsRichEditor";
import { apiOriginUrl } from "../../../utils/apiOriginUrl";

function getToken() {
  try {
    return localStorage.getItem("svn_token");
  } catch {
    return null;
  }
}

function formatDate(value) {
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return "-";
  }
}

function toDateInputValue(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function slugFromTitle(str) {
  return String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function StatusBadge({ published }) {
  return (
    <span
      className={[
        "admin-badge",
        published ? "admin-badge-green" : "admin-badge-amber",
      ].join(" ")}
    >
      {published ? "Đã xuất bản" : "Bản nháp"}
    </span>
  );
}

function FieldLabel({ children }) {
  return (
    <div className="mb-1 text-sm font-semibold text-slate-700">{children}</div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex h-9 items-center justify-center rounded-xl px-3 text-sm font-semibold transition",
        active
          ? "bg-teal-50 text-teal-700 ring-1 ring-teal-200"
          : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function NewsAdmin() {
  const [view, setView] = useState("list"); // 'list' | 'form'
  const [tab, setTab] = useState("all"); // 'all' | 'published' | 'draft'

  const [page, setPage] = useState(1);
  const limit = 10;

  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [items, setItems] = useState([]);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // form state
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const objectUrlRef = useRef(null);
  const previewUrl = useMemo(() => {
    if (!imageFile) return "";
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  useEffect(() => {
    if (!previewUrl) return;
    objectUrlRef.current = previewUrl;
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    };
  }, [previewUrl]);

  const uploadImageFiles = useCallback(async (fileList) => {
    const token = getToken();
    if (!token) {
      throw new Error("Cần đăng nhập để tải ảnh lên.");
    }
    const fd = new FormData();
    Array.from(fileList).forEach((f) => fd.append("images", f));
    const resp = await fetch(apiOriginUrl("/api/uploads/images"), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const raw = await resp.text();
    let data = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = {};
    }
    if (!resp.ok) {
      const fallback =
        resp.status === 401
          ? "Phiên đăng nhập hết hạn — đăng xuất và đăng nhập lại."
          : resp.status === 404
            ? "Không tìm thấy API upload (kiểm tra server và proxy /api)."
            : `Tải ảnh thất bại (${resp.status})`;
      throw new Error(data?.message || raw?.slice(0, 200) || fallback);
    }
    const urls = Array.isArray(data.urls) ? data.urls : [];
    if (!urls.length) {
      throw new Error("Server không trả về URL ảnh");
    }
    return urls;
  }, []);

  const listImageLibrary = useCallback(async () => {
    const token = getToken();
    if (!token) {
      throw new Error("Cần đăng nhập để xem thư viện ảnh.");
    }
    const resp = await fetch(apiOriginUrl("/api/uploads/images"), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await resp.json().catch(() => null);
    if (!resp.ok) {
      throw new Error(data?.message || "Không tải được thư viện ảnh");
    }
    return Array.isArray(data?.items) ? data.items : [];
  }, []);

  const deleteImageFromLibrary = useCallback(async (urls) => {
    const token = getToken();
    if (!token) {
      throw new Error("Cần đăng nhập để xóa ảnh.");
    }
    const resp = await fetch(apiOriginUrl("/api/uploads/cleanup"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ urls }),
    });
    const data = await resp.json().catch(() => null);
    if (!resp.ok) {
      throw new Error(data?.message || "Xóa ảnh thất bại");
    }
    return data;
  }, []);

  async function fetchNews(nextPage = page) {
    setLoadingList(true);
    setError("");
    try {
      const token = getToken();
      const resp = await fetch(
        apiOriginUrl(`/api/news?page=${nextPage}&limit=${limit}`),
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );
      const data = await resp.json().catch(() => null);
      if (!resp.ok) {
        throw new Error(data?.message || "Không tải được danh sách bài viết");
      }

      setItems(Array.isArray(data?.data) ? data.data : []);
      setPages(Number(data?.pages) || 1);
      setTotal(Number(data?.total) || 0);
      setPage(Number(data?.page) || nextPage);
    } catch (e) {
      setError(e?.message || "Có lỗi xảy ra");
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    fetchNews(1);
  }, []);

  useEffect(() => {
    fetchNews(page);
  }, [page]);

  const filteredItems = useMemo(() => {
    if (tab === "published")
      return items.filter((n) => Boolean(n?.isPublished));
    if (tab === "draft") return items.filter((n) => !n?.isPublished);
    return items;
  }, [items, tab]);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setPublishedAt("");
    setIsPublished(false);
    setExistingImageUrl("");
    setImageFile(null);
  }

  function openCreate() {
    resetForm();
    setError("");
    setView("form");
  }

  function openEdit(item) {
    setEditingId(item?._id || item?.id || null);
    setTitle(item?.title || "");
    setSlug(item?.slug || "");
    setExcerpt(item?.excerpt || "");
    setContent(item?.content || "");
    setPublishedAt(toDateInputValue(item?.publishedAt || item?.createdAt));
    setIsPublished(Boolean(item?.isPublished));
    setExistingImageUrl(item?.image || "");
    setImageFile(null);
    setError("");
    setView("form");
  }

  function backToList() {
    setView("list");
    setError("");
  }

  function handleTitleBlur() {
    const s = slugFromTitle(title);
    setSlug(s);
  }

  async function handleDelete(item) {
    const id = item?._id || item?.id;
    if (!id) return;

    const ok = window.confirm(`Xóa bài viết "${item?.title || ""}"?`);
    if (!ok) return;

    setError("");
    try {
      const token = getToken();
      const resp = await fetch(apiOriginUrl(`/api/news/${id}`), {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (resp.status !== 204) {
        const data = await resp.json().catch(() => null);
        if (!resp.ok) throw new Error(data?.message || "Xóa thất bại");
      }

      await fetchNews(page);
    } catch (e) {
      setError(e?.message || "Xóa thất bại");
    }
  }

  async function handleSubmit() {
    if (!title.trim()) {
      setError("Vui lòng nhập Tiêu đề");
      return;
    }

    setSubmitting(true);
    setError("");

    const token = getToken();
    const id = editingId;

    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("slug", slug || slugFromTitle(title));
    if (excerpt) fd.append("excerpt", excerpt);
    if (content) fd.append("content", content);
    if (publishedAt) fd.append("publishedAt", publishedAt);
    fd.append("isPublished", String(Boolean(isPublished)));
    if (imageFile) fd.append("image", imageFile);

    try {
      const resp = await fetch(apiOriginUrl(`/api/news${id ? `/${id}` : ""}`), {
        method: id ? "PUT" : "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd,
      });

      const data = await resp.json().catch(() => null);
      if (!resp.ok) {
        throw new Error(
          data?.message || (id ? "Cập nhật thất bại" : "Tạo mới thất bại"),
        );
      }

      backToList();
      resetForm();
      await fetchNews(1);
    } catch (e) {
      setError(e?.message || "Submit thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  if (view === "form") {
    const currentImageUrl = previewUrl || existingImageUrl;
    const isEditing = Boolean(editingId);
    const slugPreview = slug || slugFromTitle(title);

    return (
      <div className="space-y-6 admin-fade-up">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xl font-bold text-slate-900">
              {isEditing ? "Sửa bài viết" : "Viết bài mới"}
            </div>
            <div className="mt-1 text-sm text-slate-500">
              {isEditing ? `ID: ${editingId}` : "Tạo mới tin tức"}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={backToList}
              className="admin-button-outline inline-flex h-10 items-center justify-center px-4 text-sm font-semibold"
            >
              Quay lại
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="admin-button-primary inline-flex h-10 items-center justify-center px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="admin-card lg:col-span-2 p-5">
            <div className="grid gap-4">
              <div>
                <FieldLabel>Tiêu đề *</FieldLabel>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleBlur}
                  placeholder="Nhập tiêu đề"
                  className="admin-input h-11 w-full px-3 text-sm"
                />
                <div className="mt-2 text-xs text-slate-500">
                  Slug preview:{" "}
                  <span className="font-mono text-slate-900">
                    {slugPreview || "—"}
                  </span>
                </div>
              </div>

              <div>
                <FieldLabel>Slug</FieldLabel>
                <input
                  value={slugPreview}
                  readOnly
                  className="h-11 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm text-slate-700 outline-none"
                />
              </div>

              <div>
                <FieldLabel>Tóm tắt</FieldLabel>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                  placeholder="Nhập tóm tắt"
                  className="admin-textarea w-full resize-none px-3 py-3 text-sm"
                />
              </div>

              <div>
                <FieldLabel>Nội dung</FieldLabel>
                <NewsRichEditor
                  value={content}
                  onChange={setContent}
                  disabled={submitting}
                  uploadImages={uploadImageFiles}
                  listImages={listImageLibrary}
                  deleteImages={deleteImageFromLibrary}
                />
                <p className="mt-2 text-xs text-slate-500">
                  Soạn thảo giống Word: định dạng, danh sách, căn lề, màu. Chèn
                  ảnh trong bài: bấm biểu tượng ảnh rồi chọn file (có thể nhiều
                  ảnh). Ảnh đại diện bên phải dùng cho danh sách và thẻ bài.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>Ngày xuất bản</FieldLabel>
                  <input
                    type="date"
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                    className="admin-input h-11 w-full px-3 text-sm"
                  />
                </div>

                <div className="flex items-end">
                  <div className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        Trạng thái
                      </div>
                      <div className="text-xs text-slate-500">
                        {isPublished ? "Xuất bản" : "Bản nháp"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPublished((v) => !v)}
                      className={[
                        "relative inline-flex h-7 w-12 items-center rounded-full transition",
                        isPublished ? "bg-teal-500" : "bg-slate-200",
                      ].join(" ")}
                      aria-label="Toggle xuất bản"
                    >
                      <span
                        className={[
                          "inline-block h-5 w-5 transform rounded-full bg-white shadow transition",
                          isPublished ? "translate-x-6" : "translate-x-1",
                        ].join(" ")}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-card p-5">
            <div className="text-sm font-semibold text-slate-900">
              Ảnh bài viết
            </div>
            <div className="mt-3">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
              />
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              {currentImageUrl ? (
                <img
                  src={currentImageUrl}
                  alt="preview"
                  className="h-56 w-full object-cover"
                />
              ) : (
                <div className="flex h-56 items-center justify-center text-sm text-slate-500">
                  Chưa có ảnh
                </div>
              )}
            </div>

            {existingImageUrl && previewUrl ? (
              <div className="mt-3 text-xs text-slate-500">
                Đang xem{" "}
                <span className="font-semibold text-slate-900">ảnh mới</span>
                (ảnh cũ sẽ bị thay thế sau khi lưu)
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="space-y-6 admin-fade-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xl font-bold text-slate-900">
            Quản lý tin tức
          </div>
          <div className="mt-1 text-sm text-slate-500">
            {loadingList
              ? "Đang tải..."
              : `Trang ${page}/${pages} · Tổng ${total} bài`}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fetchNews(page)}
            className="admin-button-outline inline-flex h-10 items-center justify-center px-4 text-sm font-semibold"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="admin-button-primary inline-flex h-10 items-center justify-center px-4 text-sm font-semibold"
          >
            + Viết bài
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <TabButton active={tab === "all"} onClick={() => setTab("all")}>
          Tất cả
        </TabButton>
        <TabButton
          active={tab === "published"}
          onClick={() => setTab("published")}
        >
          Đã xuất bản
        </TabButton>
        <TabButton active={tab === "draft"} onClick={() => setTab("draft")}>
          Bản nháp
        </TabButton>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table min-w-[900px]">
            <thead>
              <tr className="text-left">
                <th>STT</th>
                <th>Ảnh</th>
                <th>Tiêu đề</th>
                <th>Ngày đăng</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, idx) => (
                <tr
                  key={item?._id || item?.id || idx}
                  className="text-sm text-slate-700"
                >
                  <td className="text-slate-500">
                    {(page - 1) * limit + idx + 1}
                  </td>
                  <td>
                    {item?.image ? (
                      <img
                        src={item.image}
                        alt={item?.title || "news"}
                        className="h-10 w-10 rounded-lg object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg border border-slate-200 bg-slate-100" />
                    )}
                  </td>
                  <td>
                    <div className="font-semibold text-slate-900">
                      {item?.title || "(Không tiêu đề)"}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {item?.slug ? (
                        <span className="font-mono">{item.slug}</span>
                      ) : (
                        "—"
                      )}
                    </div>
                  </td>
                  <td className="text-slate-600">
                    {formatDate(item?.publishedAt || item?.createdAt)}
                  </td>
                  <td>
                    <StatusBadge published={Boolean(item?.isPublished)} />
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="admin-button-outline inline-flex h-9 w-9 items-center justify-center"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                        aria-label="Trash"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loadingList && filteredItems.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-sm text-slate-500"
                    colSpan={6}
                  >
                    Không có bài viết nào trong tab này.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-500">10 bài / trang</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="admin-button-outline inline-flex h-10 items-center justify-center px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            ← Trước
          </button>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
            {page} / {pages}
          </div>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            className="admin-button-outline inline-flex h-10 items-center justify-center px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sau →
          </button>
        </div>
      </div>
    </div>
  );
}
