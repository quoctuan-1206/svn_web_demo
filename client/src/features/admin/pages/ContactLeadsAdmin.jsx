import React, { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronRight, RefreshCw } from "lucide-react";
import { getToken } from "../hooks/useAuth";
import { apiOriginUrl } from "../../../utils/apiOriginUrl";

const LIMIT = 25;

function formatDateTime(value) {
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function SourceBadge({ source }) {
  if (source === "homepage_cta") {
    return (
      <span className="admin-badge admin-badge-purple">CTA trang chủ</span>
    );
  }
  if (source === "contact_page") {
    return <span className="admin-badge admin-badge-neutral">Trang liên hệ</span>;
  }
  return <span className="admin-badge admin-badge-neutral">Khác</span>;
}

export default function ContactLeadsAdmin() {
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const fetchLeads = useCallback(async (p) => {
    setLoading(true);
    setError("");

    const token = getToken();
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      const resp = await fetch(
        apiOriginUrl(`/api/contact?page=${p}&limit=${LIMIT}`),
        { headers },
      );
      const json = await resp.json().catch(() => null);

      if (!resp.ok) {
        throw new Error(json?.message || "Không tải được danh sách liên hệ");
      }

      const data = Array.isArray(json?.data) ? json.data : [];
      const t = typeof json?.total === "number" ? json.total : data.length;
      const pg = Math.max(1, json?.pages || Math.ceil(t / LIMIT) || 1);

      setItems(data);
      setTotal(t);
      setPages(pg);
    } catch (e) {
      setError(e?.message || "Có lỗi xảy ra");
      setItems([]);
      setTotal(0);
      setPages(1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setExpandedId(null);
  }, [page]);

  useEffect(() => {
    fetchLeads(page);
  }, [page, fetchLeads]);

  function toggleExpand(id) {
    setExpandedId((cur) => (cur === id ? null : id));
  }

  return (
    <div className="space-y-6 admin-fade-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xl font-bold text-slate-900">
            Yêu cầu liên hệ
          </div>
          <div className="mt-1 text-sm text-slate-500">
            {loading
              ? "Đang tải..."
              : `Trang ${page}/${pages} · Tổng ${total} gửi từ biểu mẫu`}
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchLeads(page)}
          className="admin-button-outline inline-flex h-10 items-center justify-center gap-2 px-4 text-sm font-semibold"
        >
          <RefreshCw className="h-4 w-4" />
          Làm mới
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table min-w-[960px]">
            <thead>
              <tr className="text-left">
                <th className="w-10" />
                <th>STT</th>
                <th>Thời gian</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Công ty</th>
                <th>Chức danh</th>
                <th>Mục đích</th>
                <th>Quốc gia</th>
                <th>Nguồn</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, idx) => {
                const id = row?._id || row?.id;
                const open = expandedId === id;
                return (
                  <React.Fragment key={id || idx}>
                    <tr className="text-sm text-slate-700">
                      <td className="align-top">
                        <button
                          type="button"
                          onClick={() => id && toggleExpand(id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                          aria-expanded={open}
                          aria-label={open ? "Thu gọn chi tiết" : "Xem chi tiết"}
                          disabled={!id}
                        >
                          {open ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="align-top text-slate-500">
                        {(page - 1) * LIMIT + idx + 1}
                      </td>
                      <td className="align-top whitespace-nowrap text-slate-600">
                        {formatDateTime(row?.createdAt)}
                      </td>
                      <td className="align-top font-semibold text-slate-900">
                        {row?.fullName || "—"}
                      </td>
                      <td className="align-top max-w-[200px]">
                        {row?.email ? (
                          <a
                            href={`mailto:${encodeURIComponent(row.email)}`}
                            className="text-teal-700 underline decoration-teal-700/30 underline-offset-2 hover:text-teal-800"
                          >
                            {row.email}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="align-top max-w-[160px] truncate">
                        {row?.companyName || "—"}
                      </td>
                      <td className="align-top max-w-[140px] truncate text-slate-600">
                        {row?.jobTitle || "—"}
                      </td>
                      <td className="align-top max-w-[200px] truncate text-slate-600">
                        {row?.purpose || "—"}
                      </td>
                      <td className="align-top text-slate-600">
                        {row?.country || "—"}
                      </td>
                      <td className="align-top">
                        <SourceBadge source={row?.source} />
                      </td>
                    </tr>
                    {open ? (
                      <tr className="bg-slate-50/80 text-sm">
                        <td />
                        <td colSpan={9} className="px-4 py-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Ngành / lĩnh vực
                              </div>
                              <div className="mt-1 text-slate-800">
                                {row?.industry?.trim()
                                  ? row.industry
                                  : "— (không khai báo)"}
                              </div>
                            </div>
                            <div className="md:col-span-2">
                              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Nhu cầu / nội dung
                              </div>
                              <div className="mt-1 whitespace-pre-wrap break-words text-slate-800">
                                {row?.businessNeeds?.trim()
                                  ? row.businessNeeds
                                  : "—"}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                );
              })}

              {!loading && items.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-10 text-center text-sm text-slate-500"
                    colSpan={10}
                  >
                    Chưa có yêu cầu liên hệ nào.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-500">{LIMIT} mục / trang</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1 || loading}
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
            disabled={page >= pages || loading}
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
