"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Shield, ArrowLeft, RefreshCw, Filter, Clock, User, Activity } from "lucide-react";

interface AuditLogItem {
  id: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  createdAt: string;
  metadata?: Record<string, any>;
  user?: {
    username: string;
    displayName?: string;
    role: string;
  } | null;
}

const ACTION_COLORS: Record<string, string> = {
  USER_LOGIN: "bg-blue-100 text-blue-800 border-blue-200",
  USER_LOGOUT: "bg-gray-100 text-gray-700 border-gray-200",
  USER_REGISTER: "bg-emerald-100 text-emerald-800 border-emerald-200",
  POST_CREATE: "bg-green-100 text-green-800 border-green-200",
  POST_UPDATE: "bg-amber-100 text-amber-800 border-amber-200",
  POST_DELETE: "bg-red-100 text-red-800 border-red-200",
  PROFILE_UPDATE: "bg-purple-100 text-purple-800 border-purple-200",
  AVATAR_UPLOAD: "bg-indigo-100 text-indigo-800 border-indigo-200",
};

export default function AdminDashboardPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLogs = useCallback(
    async (targetPage = 1, currentFilter = actionFilter) => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(
          `/api/admin/audit-logs?page=${targetPage}&limit=25&action=${currentFilter}`
        );

        if (res.status === 403) {
          throw new Error("دسترسی غیرمجاز: فقط کاربران دارای نقش Admin به این بخش دسترسی دارند.");
        }
        if (!res.ok) {
          throw new Error("خطا در برقراری ارتباط با سرور");
        }

        const data = await res.json();
        setLogs(data.logs || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
        setPage(targetPage);
      } catch (err: any) {
        setError(err.message || "خطایی رخ داد");
      } finally {
        setLoading(false);
      }
    },
    [actionFilter]
  );

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 text-white rounded-xl shadow-sm">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">پنل مدیریت — Audit Logs</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                ثبت و مانیتورینگ دقیق وقایع واقعی سیستم به تفکیک کاربر، زمان و هدف
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchLogs(page)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm font-medium text-gray-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تازه‌سازی</span>
            </button>
            <Link
              href="/explore"
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 hover:text-blue-600 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>بازگشت به سایت</span>
            </Link>
          </div>
        </header>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-500">کل رویدادهای ثبت‌شده</span>
              <p className="text-lg font-bold text-gray-900">{totalCount}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3">
            <div className="p-2.5 bg-green-50 text-green-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-500">وضعیت مانیتورینگ</span>
              <p className="text-sm font-bold text-green-600">فعال (Real-Time)</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-500">کنترل سطح دسترسی</span>
              <p className="text-sm font-bold text-purple-600">نقش Admin</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-4 bg-white p-3 rounded-xl border border-gray-200">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-medium text-gray-600">فیلتر بر اساس عملیات:</span>
          <select
            value={actionFilter}
            onChange={(e) => {
              const val = e.target.value;
              setActionFilter(val);
              fetchLogs(1, val);
            }}
            className="text-xs border border-gray-300 rounded-md px-2 py-1 outline-none focus:border-blue-500 bg-white"
          >
            <option value="ALL">تمام عملیات‌ها (ALL)</option>
            <option value="POST_CREATE">ایجاد پست (POST_CREATE)</option>
            <option value="POST_UPDATE">ویرایش پست (POST_UPDATE)</option>
            <option value="POST_DELETE">حذف پست (POST_DELETE)</option>
            <option value="USER_LOGIN">ورود به سیستم (USER_LOGIN)</option>
            <option value="USER_LOGOUT">خروج از سیستم (USER_LOGOUT)</option>
            <option value="USER_REGISTER">ثبت‌نام (USER_REGISTER)</option>
            <option value="PROFILE_UPDATE">ویرایش پروفایل (PROFILE_UPDATE)</option>
          </select>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
            {error}
          </div>
        ) : loading && logs.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">در حال دریافت وقایع سامانه...</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs text-gray-600">
                <thead className="bg-gray-100/75 border-b border-gray-200 text-gray-700 font-semibold">
                  <tr>
                    <th className="py-3 px-4">کاربر (Who)</th>
                    <th className="py-3 px-4">عملیات (Action)</th>
                    <th className="py-3 px-4">هدف (Target)</th>
                    <th className="py-3 px-4">زمان دقیق (When)</th>
                    <th className="py-3 px-4">جزئیات و متادیتا (Details)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3 px-4">
                        {log.user ? (
                          <div className="font-sans flex items-center gap-1.5">
                            <span className="font-semibold text-gray-900">@{log.user.username}</span>
                            {log.user.role === "ADMIN" && (
                              <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                ADMIN
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">کاربر مهمان / نامشخص</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded border text-[11px] font-semibold ${
                            ACTION_COLORS[log.action] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-gray-800 font-sans">
                        <span className="font-medium text-gray-600">{log.targetType}</span>
                        {log.targetId && (
                          <span
                            className="text-gray-400 text-[10px] block truncate max-w-[130px]"
                            title={log.targetId}
                          >
                            {log.targetId}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-sans text-gray-500">
                        {new Intl.DateTimeFormat("fa-IR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(log.createdAt))}
                      </td>

                      <td
                        className="py-3 px-4 max-w-xs truncate text-[11px] text-gray-500"
                        title={JSON.stringify(log.metadata, null, 2)}
                      >
                        {log.metadata?.ip && (
                          <span className="bg-gray-100 px-1 py-0.5 rounded mr-1">
                            IP: {log.metadata.ip}
                          </span>
                        )}
                        {log.metadata?.preview && <span>«{log.metadata.preview}»</span>}
                        {log.metadata?.deletedContent && (
                          <span className="text-red-500">«{log.metadata.deletedContent}»</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100 text-xs">
                <button
                  disabled={page <= 1}
                  onClick={() => fetchLogs(page - 1)}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
                >
                  صفحه قبل
                </button>
                <span className="text-gray-500">
                  صفحه {page} از {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => fetchLogs(page + 1)}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
                >
                  صفحه بعد
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}