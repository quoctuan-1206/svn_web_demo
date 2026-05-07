import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Eye, Newspaper, Package } from "lucide-react";

const API_BASE = "/api";

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
    neutral: "bg-white/10 text-neutral-200 border-white/10",
    green: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
    orange: "bg-orange-500/15 text-orange-300 border-orange-500/20",
    purple: "bg-purple-500/15 text-purple-300 border-purple-500/20",
    red: "bg-red-500/15 text-red-300 border-red-500/20",
  }[tone];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}
    >
      {children}
    </span>
  );
}

function StatCard({ Icon, iconBg, iconColor, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.30)] transition hover:border-white/15 hover:bg-white/[0.07]">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-neutral-300">{label}</div>
          <div className="mt-2 text-3xl font-black tracking-tight text-white">
            {value}
          </div>
        </div>
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconBg} ring-1 ring-white/10`}
        >
          <Icon className={`h-7 w-7 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

function TableCard({ title, children, right }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 shadow-[0_14px_40px_rgba(0,0,0,0.30)]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="text-sm font-semibold text-white">{title}</div>
        {right}
      </div>
      <div className="p-2">{children}</div>
    </div>
  );
}

function SimpleTable({ rows, emptyText, renderRow }) {
  if (!rows.length) {
    return (
      <div className="px-4 py-6 text-sm text-neutral-400">{emptyText}</div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-neutral-400">
            <th className="px-4 py-3 font-semibold">Tên</th>
            <th className="px-4 py-3 font-semibold">Ngày tạo</th>
            <th className="px-4 py-3 font-semibold">Trạng thái</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {rows.map(renderRow)}
        </tbody>
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
        const [pRes, nRes] = await Promise.all([
          fetch(`${API_BASE}/api/products`, { headers }),
          fetch(`${API_BASE}/api/news?page=1&limit=100`, { headers }),
        ]);

        const pJson = await pRes.json().catch(() => null);
        const nJson = await nRes.json().catch(() => null);

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

        const newsList = Array.isArray(nJson) ? nJson : nJson?.data;

        if (!cancelled) {
          setProducts(Array.isArray(pJson) ? pJson : []);
          setNews(Array.isArray(newsList) ? newsList : []);
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
    return { totalProducts, totalNews, publishedNews, activeProducts };
  }, [products, news]);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xl font-bold text-white">Tổng quan</div>
          <div className="mt-1 text-sm text-neutral-400">
            Thống kê nhanh và dữ liệu mới nhất
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#00e676] px-4 text-sm font-semibold text-black transition hover:brightness-95"
          >
            + Thêm sản phẩm
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/news")}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            + Viết bài
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          Icon={Package}
          iconBg="bg-emerald-500/15"
          iconColor="text-emerald-300"
          label="Tổng sản phẩm"
          value={loading ? "—" : stats.totalProducts}
        />
        <StatCard
          Icon={Newspaper}
          iconBg="bg-purple-500/15"
          iconColor="text-purple-300"
          label="Tổng bài viết"
          value={loading ? "—" : stats.totalNews}
        />
        <StatCard
          Icon={CheckCircle}
          iconBg="bg-emerald-500/15"
          iconColor="text-emerald-300"
          label="Đã xuất bản"
          value={loading ? "—" : stats.publishedNews}
        />
        <StatCard
          Icon={Eye}
          iconBg="bg-orange-500/15"
          iconColor="text-orange-300"
          label="Sản phẩm active"
          value={loading ? "—" : stats.activeProducts}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TableCard
          title="5 sản phẩm mới nhất"
          right={
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="text-xs font-semibold text-[#00e676] hover:opacity-90"
            >
              Xem tất cả
            </button>
          }
        >
          <SimpleTable
            rows={latestProducts}
            emptyText={loading ? "Đang tải..." : "Chưa có sản phẩm nào"}
            renderRow={(p) => (
              <tr key={p?._id || p?.id} className="text-sm">
                <td className="px-4 py-3 font-semibold text-white">
                  {p?.title || "(Không tên)"}
                </td>
                <td className="px-4 py-3 text-neutral-300">
                  {formatDate(p?.createdAt)}
                </td>
                <td className="px-4 py-3">
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
              className="text-xs font-semibold text-[#00e676] hover:opacity-90"
            >
              Xem tất cả
            </button>
          }
        >
          <SimpleTable
            rows={latestNews}
            emptyText={loading ? "Đang tải..." : "Chưa có bài viết nào"}
            renderRow={(n) => (
              <tr key={n?._id || n?.id} className="text-sm">
                <td className="px-4 py-3 font-semibold text-white">
                  {n?.title || "(Không tiêu đề)"}
                </td>
                <td className="px-4 py-3 text-neutral-300">
                  {formatDate(n?.createdAt)}
                </td>
                <td className="px-4 py-3">
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
    </div>
  );
}
