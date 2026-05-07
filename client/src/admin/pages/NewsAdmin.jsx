import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

const API_BASE = "";

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
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        published
          ? "border-emerald-500/20 bg-emerald-500/15 text-emerald-300"
          : "border-yellow-500/25 bg-yellow-500/15 text-yellow-200",
      ].join(" ")}
    >
      {published ? "Đã xuất bản" : "Bản nháp"}
    </span>
  );
}

function FieldLabel({ children }) {
  return (
    <div className="mb-1 text-sm font-semibold text-neutral-200">
      {children}
    </div>
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
          ? "bg-[#00e676]/10 text-[#00e676] ring-1 ring-[#00e676]/25"
          : "bg-white/5 text-neutral-200 hover:bg-white/10",
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

  async function fetchNews(nextPage = page) {
    setLoadingList(true);
    setError("");
    try {
      const token = getToken();
      const resp = await fetch(
        `${API_BASE}/api/news?page=${nextPage}&limit=${limit}`,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchNews(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const resp = await fetch(`${API_BASE}/api/news/${id}`, {
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
      const resp = await fetch(`${API_BASE}/api/news${id ? `/${id}` : ""}`, {
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
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xl font-bold text-white">
              {isEditing ? "Sửa bài viết" : "Viết bài mới"}
            </div>
            <div className="mt-1 text-sm text-neutral-400">
              {isEditing ? `ID: ${editingId}` : "Tạo mới tin tức"}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={backToList}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Quay lại
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-[#00e676] px-4 text-sm font-semibold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="grid gap-4">
              <div>
                <FieldLabel>Tiêu đề *</FieldLabel>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleBlur}
                  placeholder="Nhập tiêu đề"
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#0b0b0b] px-3 text-sm text-white outline-none transition focus:border-white/20 focus:ring-4 focus:ring-[#00e676]/15"
                />
                <div className="mt-2 text-xs text-neutral-400">
                  Slug preview:{" "}
                  <span className="font-mono text-white">
                    {slugPreview || "—"}
                  </span>
                </div>
              </div>

              <div>
                <FieldLabel>Slug</FieldLabel>
                <input
                  value={slugPreview}
                  readOnly
                  className="h-11 w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-neutral-200 outline-none"
                />
              </div>

              <div>
                <FieldLabel>Tóm tắt</FieldLabel>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                  placeholder="Nhập tóm tắt"
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:ring-4 focus:ring-[#00e676]/15"
                />
              </div>

              <div>
                <FieldLabel>Nội dung</FieldLabel>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  placeholder="Nhập nội dung"
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:ring-4 focus:ring-[#00e676]/15"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>Ngày xuất bản</FieldLabel>
                  <input
                    type="date"
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                    className="h-11 w-full rounded-xl border border-white/10 bg-[#0b0b0b] px-3 text-sm text-white outline-none transition focus:border-white/20 focus:ring-4 focus:ring-[#00e676]/15"
                  />
                </div>

                <div className="flex items-end">
                  <div className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-[#0b0b0b] px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold text-white">
                        Trạng thái
                      </div>
                      <div className="text-xs text-neutral-400">
                        {isPublished ? "Xuất bản" : "Bản nháp"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPublished((v) => !v)}
                      className={[
                        "relative inline-flex h-7 w-12 items-center rounded-full transition",
                        isPublished ? "bg-[#00e676]" : "bg-white/15",
                      ].join(" ")}
                      aria-label="Toggle xuất bản"
                    >
                      <span
                        className={[
                          "inline-block h-5 w-5 transform rounded-full bg-black transition",
                          isPublished ? "translate-x-6" : "translate-x-1",
                        ].join(" ")}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-semibold text-white">Ảnh bài viết</div>
            <div className="mt-3">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-neutral-300 file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-white/15"
              />
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0b]">
              {currentImageUrl ? (
                <img
                  src={currentImageUrl}
                  alt="preview"
                  className="h-56 w-full object-cover"
                />
              ) : (
                <div className="flex h-56 items-center justify-center text-sm text-neutral-400">
                  Chưa có ảnh
                </div>
              )}
            </div>

            {existingImageUrl && previewUrl ? (
              <div className="mt-3 text-xs text-neutral-400">
                Đang xem{" "}
                <span className="font-semibold text-white">ảnh mới</span> (ảnh
                cũ sẽ bị thay thế sau khi lưu)
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xl font-bold text-white">Quản lý tin tức</div>
          <div className="mt-1 text-sm text-neutral-400">
            {loadingList
              ? "Đang tải..."
              : `Trang ${page}/${pages} · Tổng ${total} bài`}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fetchNews(page)}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#00e676] px-4 text-sm font-semibold text-black transition hover:brightness-95"
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
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-neutral-400">
                <th className="px-4 py-3 font-semibold">STT</th>
                <th className="px-4 py-3 font-semibold">Ảnh</th>
                <th className="px-4 py-3 font-semibold">Tiêu đề</th>
                <th className="px-4 py-3 font-semibold">Ngày đăng</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredItems.map((item, idx) => (
                <tr
                  key={item?._id || item?.id || idx}
                  className="text-sm transition hover:bg-white/[0.04]"
                >
                  <td className="px-4 py-3 text-neutral-300">
                    {(page - 1) * limit + idx + 1}
                  </td>
                  <td className="px-4 py-3">
                    {item?.image ? (
                      <img
                        src={item.image}
                        alt={item?.title || "news"}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg border border-white/10 bg-white/5" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">
                      {item?.title || "(Không tiêu đề)"}
                    </div>
                    <div className="mt-0.5 text-xs text-neutral-500">
                      {item?.slug ? (
                        <span className="font-mono">{item.slug}</span>
                      ) : (
                        "—"
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-300">
                    {formatDate(item?.publishedAt || item?.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge published={Boolean(item?.isPublished)} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-200 transition hover:bg-red-500/15"
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
                    className="px-4 py-8 text-center text-sm text-neutral-400"
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
        <div className="text-sm text-neutral-400">10 bài / trang</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ← Trước
          </button>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
            {page} / {pages}
          </div>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sau →
          </button>
        </div>
      </div>
    </div>
  );
}
