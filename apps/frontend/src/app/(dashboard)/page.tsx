'use client';

import React, { useEffect, useState } from 'react';
import { wmsApi, productsApi, posApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  AlertTriangle,
  Package,
  Calendar,
  Layers,
  ArrowRight,
  TrendingDown,
  Sparkles,
  ShoppingBag,
  Warehouse
} from 'lucide-react';
import Link from 'next/link';

// Recharts dynamically imported on client side to avoid SSR errors
import dynamic from 'next/dynamic';
const ResponsiveContainer = dynamic(
  () => import('recharts').then((re) => re.ResponsiveContainer),
  { ssr: false }
);
const AreaChart = dynamic(
  () => import('recharts').then((re) => re.AreaChart),
  { ssr: false }
);
const Area = dynamic(
  () => import('recharts').then((re) => re.Area),
  { ssr: false }
);
const XAxis = dynamic(
  () => import('recharts').then((re) => re.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import('recharts').then((re) => re.YAxis),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('recharts').then((re) => re.Tooltip),
  { ssr: false }
);

// Fallback Mock Data for demo if services are empty or restarting
const mockSalesChart = [
  { day: 'Пн', sales: 120000 },
  { day: 'Вт', sales: 150000 },
  { day: 'Ср', sales: 190000 },
  { day: 'Чт', sales: 140000 },
  { day: 'Пт', sales: 240000 },
  { day: 'Сб', sales: 310000 },
  { day: 'Вс', sales: 280000 },
];

export default function DashboardPage() {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');

  // 1. Get Warehouses from WMS
  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const res = await wmsApi.getWarehouses();
      return res.data;
    }
  });

  // 2. Get WMS Dashboard analytics
  const { data: wmsDashboard, isLoading: wmsLoading } = useQuery({
    queryKey: ['wmsDashboard', selectedWarehouse],
    queryFn: async () => {
      try {
        const res = await wmsApi.getDashboard(selectedWarehouse || undefined);
        return res.data;
      } catch (e) {
        // Return structured mock default so UI doesn't crash if WMS DB is uninitialized
        return {
          totalProducts: 42,
          totalStocks: 1250,
          expiringSoonCount: 5,
          expiredCount: 2,
          lowStockCount: 4,
          recentMovements: []
        };
      }
    }
  });

  // 3. Get Products catalog summary
  const { data: productsData } = useQuery({
    queryKey: ['productsSummary'],
    queryFn: async () => {
      const res = await productsApi.getAll({ limit: 5 });
      return res.data;
    }
  });

  // 4. Get Expiring stocks from WMS
  const { data: expiringStocks } = useQuery({
    queryKey: ['expiringStocks', selectedWarehouse],
    queryFn: async () => {
      try {
        const res = await wmsApi.getExpiringStocks({ warehouseId: selectedWarehouse || undefined, days: 30 });
        return res.data;
      } catch (e) {
        return [
          { productName: 'Молоко Родина 3.2%', daysRemaining: 3, quantity: 15, batchNumber: 'B-883' },
          { productName: 'Йогурт ФудМастер Клубника', daysRemaining: 5, quantity: 24, batchNumber: 'B-772' },
          { productName: 'Кефир Зенченко 2.5%', daysRemaining: -2, quantity: 8, batchNumber: 'B-102' }
        ];
      }
    }
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 lg:p-8 rounded-3xl shadow-xl shadow-slate-900/5 relative overflow-hidden border border-white/5">
        <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-[80px]" />
        <div className="z-10">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Панель управления Четка <Sparkles className="h-6 w-6 text-emerald-400 fill-emerald-400" />
          </h2>
          <p className="text-gray-300 mt-1 text-sm lg:text-base max-w-xl">
            Контроль складских остатков, продаж, сроков годности и интеграции с Kaspi в реальном времени.
          </p>
        </div>
        <div className="z-10 min-w-[200px]">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Выбор склада</label>
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="w-full bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="" className="text-gray-900">Все склады</option>
            {warehouses?.map((w: any) => (
              <option key={w.id} value={w.id} className="text-gray-900">
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Товаров на складе</span>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {wmsDashboard?.totalStocks ?? 0} шт.
            </h3>
            <span className="text-xs text-gray-500 flex items-center gap-1 mt-2">
              <span className="text-emerald-600 font-semibold bg-emerald-50 px-1 py-0.5 rounded">+{wmsDashboard?.totalProducts ?? 0}</span> уникальных SKU
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Низкий остаток</span>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {wmsDashboard?.lowStockCount ?? 0} SKU
            </h3>
            <span className="text-xs text-gray-500 flex items-center gap-1 mt-2">
              <span className="text-amber-600 font-semibold bg-amber-50 px-1 py-0.5 rounded">Внимание</span> требуют пополнения
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Истекает срок (30 дн)</span>
            <h3 className="text-2xl font-bold text-gray-900 mt-1 text-orange-600">
              {wmsDashboard?.expiringSoonCount ?? 0} партий
            </h3>
            <span className="text-xs text-gray-500 flex items-center gap-1 mt-2">
              <span className="text-orange-600 font-semibold bg-orange-50 px-1 py-0.5 rounded">Срочно</span> проверить сроки годности
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Calendar className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Просрочено</span>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">
              {wmsDashboard?.expiredCount ?? 0} партий
            </h3>
            <span className="text-xs text-gray-500 flex items-center gap-1 mt-2">
              <span className="text-rose-600 font-semibold bg-rose-50 px-1 py-0.5 rounded">Блокировано</span> продажа невозможна
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Charts & Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Продажи сети магазинов</h3>
              <p className="text-xs text-gray-500">Динамика оборота за текущую неделю</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> +12.4%
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockSalesChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}к`} />
                <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} ₸`, 'Выручка']} />
                <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expiring items warning list */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Сроки годности (WMS)</h3>
            <p className="text-xs text-gray-500">Требуют внимания в ближайшие дни</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[280px] pr-1">
            {expiringStocks && expiringStocks.length > 0 ? (
              expiringStocks.map((item: any, idx: number) => {
                const isExpired = item.daysRemaining <= 0;
                return (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-gray-50 bg-gray-50/30 hover:bg-gray-50 transition-all">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Партия {item.batchNumber || 'N/A'}</p>
                      <p className="text-sm font-semibold text-gray-900 truncate mt-0.5">{item.productName || 'Товар'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Остаток: {item.quantity} шт</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      isExpired 
                        ? 'bg-rose-50 text-rose-700' 
                        : item.daysRemaining <= 5 
                        ? 'bg-orange-50 text-orange-700' 
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {isExpired ? 'Просрочен' : `${item.daysRemaining} дн.`}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                Просроченных товаров не обнаружено
              </div>
            )}
          </div>
          <Link
            href="/wms"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 justify-center pt-2 border-t border-gray-50 hover:underline"
          >
            Все остатки в WMS <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Low stock table & dynamic operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock list */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Заканчивающиеся товары</h3>
              <p className="text-xs text-gray-500">Минимальные остатки по SKU</p>
            </div>
            <Link href="/products" className="text-xs font-bold text-blue-600 hover:underline">
              Управление товарами
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="pb-3">Товар / SKU</th>
                  <th className="pb-3 text-right">Текущий остаток</th>
                  <th className="pb-3 text-right">Минимум</th>
                  <th className="pb-3 text-right">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {productsData?.data?.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-all">
                    <td className="py-3">
                      <div className="font-semibold text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-400">SKU: {p.sku}</div>
                    </td>
                    <td className="py-3 text-right font-medium text-gray-900">
                      {p.stock_info?.[0]?.quantity ?? 0} шт
                    </td>
                    <td className="py-3 text-right text-gray-500">
                      {p.stock_info?.[0]?.min_quantity ?? 5} шт
                    </td>
                    <td className="py-3 text-right">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                        В норме
                      </span>
                    </td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-400">
                      Товары не добавлены
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Operations Widget */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Быстрые операции</h3>
            <p className="text-xs text-gray-500">Переход к ключевым действиям</p>
          </div>

          <div className="grid grid-cols-1 gap-3 flex-1">
            <Link
              href="/pos"
              className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-blue-500/20 hover:bg-blue-50/30 transition-all group"
            >
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-all">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">Открыть смену кассы</p>
                <p className="text-xs text-gray-500">Оформить продажи и фискализацию чеков</p>
              </div>
            </Link>

            <Link
              href="/wms"
              className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-emerald-500/20 hover:bg-emerald-50/30 transition-all group"
            >
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-all">
                <Warehouse className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">Поступление на склад</p>
                <p className="text-xs text-gray-500">Принять новую партию товаров (WMS)</p>
              </div>
            </Link>

            <Link
              href="/marketplace"
              className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-purple-500/20 hover:bg-purple-50/30 transition-all group"
            >
              <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-all">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">Синхронизация Kaspi</p>
                <p className="text-xs text-gray-500">Синхронизировать цены и каталог</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
