import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
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

function StatusBadge({ active }) {
  return (
    <span
      className={[
        "admin-badge",
        active ? "admin-badge-green" : "admin-badge-red",
      ].join(" ")}
    >
      {active ? "Hiển thị" : "Ẩn"}
    </span>
  );
}

const PAGE_LABELS = {
  product: {
    manageTitle: "Quản lý sản phẩm",
    addButton: "+ Thêm sản phẩm",
    addTitle: "Thêm sản phẩm",
    editTitle: "Sửa sản phẩm",
    createSubtitle: "Tạo mới sản phẩm",
    imageLabel: "Ảnh sản phẩm",
    statusHint: "Hiển thị / Ẩn sản phẩm",
    emptyList: "Chưa có sản phẩm nào",
    emptyAction: "+ Thêm sản phẩm",
    listError: "Không tải được danh sách sản phẩm",
    deleteConfirm: (title) => `Xóa sản phẩm "${title}"?`,
    countLabel: (n) => `${n} sản phẩm`,
  },
  solution: {
    manageTitle: "Quản lý giải pháp",
    addButton: "+ Thêm giải pháp",
    addTitle: "Thêm giải pháp",
    editTitle: "Sửa giải pháp",
    createSubtitle: "Tạo mới giải pháp",
    imageLabel: "Ảnh giải pháp",
    statusHint: "Hiển thị / Ẩn giải pháp",
    emptyList: "Chưa có giải pháp nào",
    emptyAction: "+ Thêm giải pháp",
    listError: "Không tải được danh sách giải pháp",
    deleteConfirm: (title) => `Xóa giải pháp "${title}"?`,
    countLabel: (n) => `${n} giải pháp`,
  },
};

function FieldLabel({ children }) {
  return (
    <div className="mb-1 text-sm font-semibold text-slate-700">{children}</div>
  );
}

export default function ProductsAdmin({ fixedCategory = "product" }) {
  const navigate = useNavigate();
  const labels = PAGE_LABELS[fixedCategory] || PAGE_LABELS.product;

  const [view, setView] = useState("list"); // 'list' | 'form'
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [items, setItems] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [existingSlug, setExistingSlug] = useState("");
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [autoTranslateEn, setAutoTranslateEn] = useState(true);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const objectUrlRef = useRef(null);
  const previewUrl = useMemo(() => {
    if (!imageFile) return "";
    const url = URL.createObjectURL(imageFile);
    return url;
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
          ? "Phiên đăng nhập hết hạn — đăng nhập lại."
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

  async function fetchProducts() {
    setLoadingList(true);
    setError("");
    try {
      const token = getToken();
      const resp = await fetch(apiOriginUrl("/api/products"), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await resp.json().catch(() => null);
      if (!resp.ok) {
        throw new Error(data?.message || labels.listError);
      }
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Có lỗi xảy ra");
    } finally {
      setLoadingList(false);
    }
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const cat = item?.category || "product";
      return cat === fixedCategory;
    });
  }, [items, fixedCategory]);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setExcerpt("");
    setContent("");
    setExistingSlug("");
    setOrder(0);
    setIsActive(true);
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
    setDescription(item?.description || "");
    setExcerpt(item?.excerpt || "");
    setContent(item?.content || "");
    setExistingSlug(item?.slug || "");
    setOrder(Number.isFinite(Number(item?.order)) ? Number(item.order) : 0);
    setIsActive(item?.isActive !== false);
    setExistingImageUrl(item?.image || "");
    setImageFile(null);
    setError("");
    setView("form");
  }

  function backToList() {
    setView("list");
    setError("");
  }

  async function handleDelete(item) {
    const id = item?._id || item?.id;
    if (!id) return;

    const ok = window.confirm(labels.deleteConfirm(item?.title || ""));
    if (!ok) return;

    setError("");
    try {
      const token = getToken();
      const resp = await fetch(apiOriginUrl(`/api/products/${id}`), {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (resp.status !== 204) {
        const data = await resp.json().catch(() => null);
        if (!resp.ok) throw new Error(data?.message || "Xóa thất bại");
      }

      await fetchProducts();
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

    const id = editingId;
    const token = getToken();

    const fd = new FormData();
    fd.append("title", title.trim());
    if (description) fd.append("description", description);
    fd.append("excerpt", excerpt ?? "");
    fd.append("content", content ?? "");
    fd.append("category", fixedCategory);
    fd.append("order", String(order ?? 0));
    fd.append("isActive", String(Boolean(isActive)));
    if (imageFile) fd.append("image", imageFile);
    fd.append("autoTranslateEn", String(autoTranslateEn));

    try {
      const resp = await fetch(
        apiOriginUrl(`/api/products${id ? `/${id}` : ""}`),
        {
          method: id ? "PUT" : "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: fd,
        },
      );

      const data = await resp.json().catch(() => null);
      if (!resp.ok) {
        throw new Error(
          data?.message || (id ? "Cập nhật thất bại" : "Tạo mới thất bại"),
        );
      }

      backToList();
      resetForm();
      await fetchProducts();
    } catch (e) {
      setError(e?.message || "Submit thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  if (view === "form") {
    const currentImageUrl = previewUrl || existingImageUrl;
    const isEditing = Boolean(editingId);

    return (
      <div className="space-y-6 admin-fade-up">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xl font-bold text-slate-900">
              {isEditing ? labels.editTitle : labels.addTitle}
            </div>
            <div className="mt-1 text-sm text-slate-500">
              {isEditing ? `ID: ${editingId}` : labels.createSubtitle}
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
                  placeholder="Nhập tiêu đề"
                  className="admin-input h-11 w-full px-3 text-sm"
                />
              </div>

              <div>
                <FieldLabel>Mô tả ngắn (danh sách)</FieldLabel>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Hiển thị trên trang danh sách / thẻ"
                  rows={4}
                  className="admin-textarea w-full resize-none px-3 py-3 text-sm"
                />
              </div>

              <div>
                <FieldLabel>Tóm tắt (trang chi tiết)</FieldLabel>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Đoạn dẫn dưới tiêu đề trang chi tiết (tuỳ chọn)"
                  rows={3}
                  className="admin-textarea w-full resize-none px-3 py-3 text-sm"
                />
              </div>

              {isEditing && existingSlug ? (
                <div>
                  <FieldLabel>Slug URL</FieldLabel>
                  <input
                    value={existingSlug}
                    readOnly
                    className="h-11 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3 font-mono text-xs text-slate-700 outline-none"
                  />
                </div>
              ) : null}

              <div>
                <FieldLabel>Nội dung chi tiết</FieldLabel>
                <NewsRichEditor
                  value={content}
                  onChange={setContent}
                  disabled={submitting}
                  uploadImages={uploadImageFiles}
                  listImages={listImageLibrary}
                  deleteImages={deleteImageFromLibrary}
                />
                <p className="mt-2 text-xs text-slate-500">
                  Soạn nội dung đầy đủ; ảnh trong bài: biểu tượng ảnh → chọn
                  file.
                </p>
              </div>

              <div>
                <FieldLabel>Thứ tự</FieldLabel>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="admin-input h-11 w-full px-3 text-sm"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Trạng thái
                  </div>
                  <div className="text-xs text-slate-500">{labels.statusHint}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive((v) => !v)}
                  className={[
                    "relative inline-flex h-7 w-12 items-center rounded-full transition",
                    isActive ? "bg-teal-500" : "bg-slate-200",
                  ].join(" ")}
                  aria-label="Toggle hiển thị"
                >
                  <span
                    className={[
                      "inline-block h-5 w-5 transform rounded-full bg-white shadow transition",
                      isActive ? "translate-x-6" : "translate-x-1",
                    ].join(" ")}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-teal-200 bg-teal-50/60 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Tự động dịch tiếng Anh
                  </div>
                  <div className="text-xs text-slate-500">
                    Khi lưu, hệ thống dịch tiêu đề và nội dung sang EN cho
                    website
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoTranslateEn((v) => !v)}
                  className={[
                    "relative inline-flex h-7 w-12 items-center rounded-full transition",
                    autoTranslateEn ? "bg-teal-500" : "bg-slate-200",
                  ].join(" ")}
                  aria-label="Bật tắt dịch tự động"
                >
                  <span
                    className={[
                      "inline-block h-5 w-5 transform rounded-full bg-white shadow transition",
                      autoTranslateEn ? "translate-x-6" : "translate-x-1",
                    ].join(" ")}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="admin-card p-5">
            <div className="text-sm font-semibold text-slate-900">
              {labels.imageLabel}
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

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            ← Về Dashboard
          </button>
          <div className="text-xs text-slate-500">
            Submit bằng <span className="font-mono">FormData</span>
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
            {labels.manageTitle}
          </div>
          <div className="mt-1 text-sm text-slate-500">
            {loadingList
              ? "Đang tải..."
              : labels.countLabel(filteredItems.length)}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchProducts}
            className="admin-button-outline inline-flex h-10 items-center justify-center px-4 text-sm font-semibold"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="admin-button-primary inline-flex h-10 items-center justify-center px-4 text-sm font-semibold"
          >
            {labels.addButton}
          </button>
        </div>
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
                <th>Trạng thái</th>
                <th>Tạo lúc</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, idx) => (
                <tr
                  key={item?._id || item?.id || idx}
                  className="text-sm text-slate-700"
                >
                  <td className="text-slate-500">{idx + 1}</td>
                  <td>
                    {item?.image ? (
                      <img
                        src={item.image}
                        alt={item?.title || "product"}
                        className="h-10 w-10 rounded-lg object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg border border-slate-200 bg-slate-100" />
                    )}
                  </td>
                  <td>
                    <div className="font-semibold text-slate-900">
                      {item?.title || "(Không tên)"}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      Order:{" "}
                      {Number.isFinite(Number(item?.order)) ? item.order : 0}
                    </div>
                  </td>
                  <td>
                    <StatusBadge active={item?.isActive !== false} />
                  </td>
                  <td className="text-slate-600">
                    {formatDate(item?.createdAt)}
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
                    {labels.emptyList}. Bấm{" "}
                    <span className="font-semibold text-slate-900">
                      {labels.emptyAction}
                    </span>{" "}
                    để tạo mới.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-slate-500">
        Ảnh admin được lưu trên Cloudinary (URL dạng{" "}
        <span className="font-mono">res.cloudinary.com/...</span>).
      </div>
    </div>
  );
}
