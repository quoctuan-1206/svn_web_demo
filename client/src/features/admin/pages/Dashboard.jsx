import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Eye,
  Mail,
  Newspaper,
  Package,
} from "lucide-react";

import { apiFetch } from "../../../utils/apiOriginUrl";

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

function StatusBadge({ tone = "neutral", children }) {
  const cls = {
    neutral: "admin-badge admin-badge-neutral",
    green: "admin-badge admin-badge-green",
    orange: "admin-badge admin-badge-amber",
    purple: "admin-badge admin-badge-purple",
    red: "admin-badge admin-badge-red",
  }[tone];

  return <span className={cls}>{children}</span>;
}

function StatCard({ Icon, iconBg, iconColor, label, value }) {
  return (
    <div className="admin-card p-5 transition hover:border-slate-300">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-slate-500">{label}</div>
          <div className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            {value}
          </div>
        </div>
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconBg} ring-1 ring-slate-200`}
        >
          <Icon className={`h-7 w-7 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

function TableCard({ title, children, right }) {
  return (
    <div className="admin-card">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        {right}
      </div>
      <div className="p-2">{children}</div>
    </div>
  );
}

function SimpleTable({ rows, emptyText, renderRow }) {
  if (!rows.length) {
    return <div className="px-4 py-6 text-sm text-slate-500">{emptyText}</div>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <table className="admin-table">
        <thead>
          <tr className="text-left">
            <th>Tên</th>
            <th>Ngày tạo</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>{rows.map(renderRow)}</tbody>
      </table>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [news, setNews] = useState([]);
  const [contactLeads, setContactLeads] = useState([]);
  const [contactTotal, setContactTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      const token = (() => {
        try {
          return localStorage.getItem("svn_token");
        } catch {
          return null;
        }
      })();

      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      try {
        const [pRes, nRes, cRes] = await Promise.all([
          apiFetch("/api/products", { headers }),
          apiFetch("/api/news?page=1&limit=100", { headers }),
          apiFetch("/api/contact?page=1&limit=200", { headers }),
        ]);

        const pJson = await pRes.json().catch(() => null);
        const nJson = await nRes.json().catch(() => null);
        const cJson = await cRes.json().catch(() => null);

        if (!pRes.ok) {
          throw new Error(
            pJson?.message || "Không tải được danh sách sản phẩm",
          );
        }
        if (!nRes.ok) {
          throw new Error(
            nJson?.message || "Không tải được danh sách bài viết",
          );
        }
        if (!cRes.ok) {
          throw new Error(
            cJson?.message || "Không tải được yêu cầu liên hệ",
          );
        }

        const newsList = Array.isArray(nJson) ? nJson : nJson?.data;
        const leads = Array.isArray(cJson?.data) ? cJson.data : [];

        if (!cancelled) {
          setProducts(Array.isArray(pJson) ? pJson : []);
          setNews(Array.isArray(newsList) ? newsList : []);
          setContactLeads(leads);
          setContactTotal(
            typeof cJson?.total === "number" ? cJson.total : leads.length,
          );
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || "Có lỗi xảy ra");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalNews = news.length;
    const publishedNews = news.filter((n) => Boolean(n?.isPublished)).length;
    const activeProducts = products.filter((p) => p?.isActive !== false).length;
    return {
      totalProducts,
      totalNews,
      publishedNews,
      activeProducts,
      totalContactLeads: contactTotal,
    };
  }, [products, news, contactTotal]);

  const latestProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))
      .slice(0, 5);
  }, [products]);

  const latestNews = useMemo(() => {
    return [...news]
      .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))
      .slice(0, 5);
  }, [news]);

  const latestContactLeads = useMemo(() => {
    return [...contactLeads]
      .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))
      .slice(0, 8);
  }, [contactLeads]);

  return (
    <div className="space-y-6 admin-fade-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xl font-bold text-slate-900">Tổng quan</div>
          <div className="mt-1 text-sm text-slate-500">
            Thống kê nhanh và dữ liệu mới nhất
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="admin-button-primary inline-flex h-10 items-center justify-center px-4 text-sm font-semibold"
          >
            + Thêm sản phẩm
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/news")}
            className="admin-button-outline inline-flex h-10 items-center justify-center px-4 text-sm font-semibold"
          >
            + Viết bài
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          Icon={Package}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          label="Tổng sản phẩm"
          value={loading ? "—" : stats.totalProducts}
        />
        <StatCard
          Icon={Newspaper}
          iconBg="bg-indigo-100"
          iconColor="text-indigo-600"
          label="Tổng bài viết"
          value={loading ? "—" : stats.totalNews}
        />
        <StatCard
          Icon={CheckCircle}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          label="Đã xuất bản"
          value={loading ? "—" : stats.publishedNews}
        />
        <StatCard
          Icon={Eye}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          label="Sản phẩm active"
          value={loading ? "—" : stats.activeProducts}
        />
        <StatCard
          Icon={Mail}
          iconBg="bg-sky-100"
          iconColor="text-sky-600"
          label="Yêu cầu liên hệ"
          value={loading ? "—" : stats.totalContactLeads}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TableCard
          title="5 sản phẩm mới nhất"
          right={
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800"
            >
              Xem tất cả
            </button>
          }
        >
          <SimpleTable
            rows={latestProducts}
            emptyText={loading ? "Đang tải..." : "Chưa có sản phẩm nào"}
            renderRow={(p) => (
              <tr key={p?._id || p?.id} className="text-sm text-slate-700">
                <td className="font-semibold text-slate-900">
                  {p?.title || "(Không tên)"}
                </td>
                <td className="text-slate-600">{formatDate(p?.createdAt)}</td>
                <td>
                  {p?.isActive === false ? (
                    <StatusBadge tone="red">Inactive</StatusBadge>
                  ) : (
                    <StatusBadge tone="orange">Active</StatusBadge>
                  )}
                </td>
              </tr>
            )}
          />
        </TableCard>

        <TableCard
          title="5 bài viết mới nhất"
          right={
            <button
              type="button"
              onClick={() => navigate("/admin/news")}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800"
            >
              Xem tất cả
            </button>
          }
        >
          <SimpleTable
            rows={latestNews}
            emptyText={loading ? "Đang tải..." : "Chưa có bài viết nào"}
            renderRow={(n) => (
              <tr key={n?._id || n?.id} className="text-sm text-slate-700">
                <td className="font-semibold text-slate-900">
                  {n?.title || "(Không tiêu đề)"}
                </td>
                <td className="text-slate-600">{formatDate(n?.createdAt)}</td>
                <td>
                  {n?.isPublished ? (
                    <StatusBadge tone="green">Published</StatusBadge>
                  ) : (
                    <StatusBadge tone="neutral">Draft</StatusBadge>
                  )}
                </td>
              </tr>
            )}
          />
        </TableCard>
      </div>

      <TableCard
        title="Yêu cầu liên hệ gần đây"
        right={
          <button
            type="button"
            onClick={() => navigate("/admin/contacts")}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800"
          >
            Xem tất cả
          </button>
        }
      >
        {!latestContactLeads.length ? (
          <div className="px-4 py-6 text-sm text-slate-500">
            {loading ? "Đang tải..." : "Chưa có yêu cầu liên hệ nào"}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="admin-table">
              <thead>
                <tr className="text-left">
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Công ty</th>
                  <th>Mục đích</th>
                  <th>Nguồn</th>
                  <th>Ngày gửi</th>
                </tr>
              </thead>
              <tbody>
                {latestContactLeads.map((row) => (
                  <tr
                    key={row?._id || row?.id}
                    className="text-sm text-slate-700"
                  >
                    <td className="font-semibold text-slate-900">
                      {row?.fullName || "—"}
                    </td>
                    <td className="max-w-[200px] truncate text-slate-600">
                      {row?.email || "—"}
                    </td>
                    <td className="max-w-[160px] truncate">
                      {row?.companyName || "—"}
                    </td>
                    <td className="max-w-[180px] truncate text-slate-600">
                      {row?.purpose || "—"}
                    </td>
                    <td>
                      {row?.source === "homepage_cta" ? (
                        <StatusBadge tone="purple">CTA</StatusBadge>
                      ) : row?.source === "contact_page" ? (
                        <StatusBadge tone="neutral">Trang LH</StatusBadge>
                      ) : (
                        <StatusBadge tone="neutral">Web</StatusBadge>
                      )}
                    </td>
                    <td className="text-slate-600 whitespace-nowrap">
                      {formatDate(row?.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TableCard>
    </div>
  );
}
