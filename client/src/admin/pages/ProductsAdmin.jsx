import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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

function StatusBadge({ active }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        active
          ? "border-emerald-500/20 bg-emerald-500/15 text-emerald-300"
          : "border-red-500/20 bg-red-500/15 text-red-300",
      ].join(" ")}
    >
      {active ? "Hiển thị" : "Ẩn"}
    </span>
  );
}

function CategoryBadge({ category }) {
  const label =
    category === "solution"
      ? "Giải pháp"
      : category === "product"
        ? "Sản phẩm"
        : "—";
  const tone =
    category === "solution"
      ? "border-purple-500/20 bg-purple-500/15 text-purple-300"
      : category === "product"
        ? "border-sky-500/20 bg-sky-500/15 text-sky-300"
        : "border-white/10 bg-white/5 text-neutral-200";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        tone,
      ].join(" ")}
    >
      {label}
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

export default function ProductsAdmin() {
  const navigate = useNavigate();

  const [view, setView] = useState("list"); // 'list' | 'form'
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [items, setItems] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("product");
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
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

  async function fetchProducts() {
    setLoadingList(true);
    setError("");
    try {
      const token = getToken();
      const resp = await fetch(`${API_BASE}/api/products`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await resp.json().catch(() => null);
      if (!resp.ok) {
        throw new Error(data?.message || "Không tải được danh sách sản phẩm");
      }
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Có lỗi xảy ra");
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setCategory("product");
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
    setCategory(item?.category || "product");
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

    const ok = window.confirm(`Xóa sản phẩm "${item?.title || ""}"?`);
    if (!ok) return;

    setError("");
    try {
      const token = getToken();
      const resp = await fetch(`${API_BASE}/api/products/${id}`, {
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
    if (category) fd.append("category", category);
    fd.append("order", String(order ?? 0));
    fd.append("isActive", String(Boolean(isActive)));
    if (imageFile) fd.append("image", imageFile);

    try {
      const resp = await fetch(
        `${API_BASE}/api/products${id ? `/${id}` : ""}`,
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
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xl font-bold text-white">
              {isEditing ? "Sửa sản phẩm" : "Thêm sản phẩm"}
            </div>
            <div className="mt-1 text-sm text-neutral-400">
              {isEditing ? `ID: ${editingId}` : "Tạo mới sản phẩm"}
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
                  placeholder="Nhập tiêu đề"
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#0b0b0b] px-3 text-sm text-white outline-none transition focus:border-white/20 focus:ring-4 focus:ring-[#00e676]/15"
                />
              </div>

              <div>
                <FieldLabel>Mô tả</FieldLabel>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập mô tả"
                  rows={5}
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:ring-4 focus:ring-[#00e676]/15"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>Danh mục</FieldLabel>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-11 w-full rounded-xl border border-white/10 bg-[#0b0b0b] px-3 text-sm text-white outline-none transition focus:border-white/20 focus:ring-4 focus:ring-[#00e676]/15"
                  >
                    <option value="product">Sản phẩm</option>
                    <option value="solution">Giải pháp</option>
                  </select>
                </div>

                <div>
                  <FieldLabel>Thứ tự</FieldLabel>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="h-11 w-full rounded-xl border border-white/10 bg-[#0b0b0b] px-3 text-sm text-white outline-none transition focus:border-white/20 focus:ring-4 focus:ring-[#00e676]/15"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0b0b0b] px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-white">
                    Trạng thái
                  </div>
                  <div className="text-xs text-neutral-400">
                    Hiển thị / Ẩn sản phẩm
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive((v) => !v)}
                  className={[
                    "relative inline-flex h-7 w-12 items-center rounded-full transition",
                    isActive ? "bg-[#00e676]" : "bg-white/15",
                  ].join(" ")}
                  aria-label="Toggle hiển thị"
                >
                  <span
                    className={[
                      "inline-block h-5 w-5 transform rounded-full bg-black transition",
                      isActive ? "translate-x-6" : "translate-x-1",
                    ].join(" ")}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-semibold text-white">Ảnh sản phẩm</div>
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

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="text-sm font-semibold text-neutral-300 hover:text-white"
          >
            ← Về Dashboard
          </button>
          <div className="text-xs text-neutral-500">
            Submit bằng <span className="font-mono">FormData</span>
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
          <div className="text-xl font-bold text-white">Quản lý sản phẩm</div>
          <div className="mt-1 text-sm text-neutral-400">
            {loadingList ? "Đang tải..." : `${items.length} sản phẩm`}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchProducts}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#00e676] px-4 text-sm font-semibold text-black transition hover:brightness-95"
          >
            + Thêm sản phẩm
          </button>
        </div>
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
                <th className="px-4 py-3 font-semibold">Danh mục</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 font-semibold">Tạo lúc</th>
                <th className="px-4 py-3 font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {items.map((item, idx) => (
                <tr
                  key={item?._id || item?.id || idx}
                  className="text-sm transition hover:bg-white/[0.04]"
                >
                  <td className="px-4 py-3 text-neutral-300">{idx + 1}</td>
                  <td className="px-4 py-3">
                    {item?.image ? (
                      <img
                        src={item.image}
                        alt={item?.title || "product"}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg border border-white/10 bg-white/5" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">
                      {item?.title || "(Không tên)"}
                    </div>
                    <div className="mt-0.5 text-xs text-neutral-500">
                      Order:{" "}
                      {Number.isFinite(Number(item?.order)) ? item.order : 0}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <CategoryBadge category={item?.category} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge active={item?.isActive !== false} />
                  </td>
                  <td className="px-4 py-3 text-neutral-300">
                    {formatDate(item?.createdAt)}
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

              {!loadingList && items.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-sm text-neutral-400"
                    colSpan={7}
                  >
                    Chưa có sản phẩm nào. Bấm{" "}
                    <span className="font-semibold text-white">
                      + Thêm sản phẩm
                    </span>{" "}
                    để tạo mới.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-neutral-500">
        Tip: API ảnh trả từ backend dạng{" "}
        <span className="font-mono">/uploads/...</span> hoặc URL đầy đủ.
      </div>
    </div>
  );
}
