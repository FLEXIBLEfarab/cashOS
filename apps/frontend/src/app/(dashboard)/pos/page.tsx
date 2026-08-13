'use client';

import React, { useState } from 'react';
import { posApi, productsApi } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Store,
  Calendar,
  DollarSign,
  PlusCircle,
  MinusCircle,
  Layers,
  ShoppingBag,
  User,
  Loader2,
  CheckCircle,
  Play,
  XCircle,
  FileText,
  AlertCircle
} from 'lucide-react';

export default function PosPage() {
  const queryClient = useQueryClient();
  const [activeShift, setActiveShift] = useState<any>(null);

  // Forms
  const [terminalId, setTerminalId] = useState('TERM-01');
  const [openingCash, setOpeningCash] = useState(15000);
  const [closingCash, setClosingCash] = useState(15000);
  const [shiftNote, setShiftNote] = useState('');

  // Cash In / Out Form
  const [showCashInOutModal, setShowCashInOutModal] = useState<'in' | 'out' | null>(null);
  const [cashInOutAmount, setCashInOutAmount] = useState(5000);
  const [cashInOutReason, setCashInOutReason] = useState('');

  // Sale Simulation State
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [saleItems, setSaleItems] = useState<any[]>([{ productId: '', quantity: 1, price: 0 }]);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'KASPI_PAY' | 'QR'>('CASH');

  // Queries
  const { data: products } = useQuery({
    queryKey: ['posProducts'],
    queryFn: async () => {
      const res = await productsApi.getAll({ limit: 50 });
      return res.data;
    }
  });

  // Mutations
  const openShiftMutation = useMutation({
    mutationFn: () => posApi.openShift({ terminalId, openingCash }),
    onSuccess: (res) => {
      setActiveShift(res.data);
      queryClient.invalidateQueries({ queryKey: ['wmsDashboard'] });
    }
  });

  const closeShiftMutation = useMutation({
    mutationFn: () => posApi.closeShift({
      shiftId: activeShift.shiftId,
      closingCash,
      note: shiftNote || null
    }),
    onSuccess: () => {
      setActiveShift(null);
      setShiftNote('');
    }
  });

  const cashInOutMutation = useMutation({
    mutationFn: ({ type, amount, reason }: { type: 'in' | 'out'; amount: number; reason: string }) => {
      const payload = { amount, reason };
      return type === 'in'
        ? posApi.cashIn(activeShift.shiftId, payload)
        : posApi.cashOut(activeShift.shiftId, payload);
    },
    onSuccess: (res) => {
      // Update local shift aggregate totals dynamically
      const updated = { ...activeShift };
      if (showCashInOutModal === 'in') {
        updated.cashInTotal = (updated.cashInTotal || 0) + cashInOutAmount;
      } else {
        updated.cashOutTotal = (updated.cashOutTotal || 0) + cashInOutAmount;
      }
      setActiveShift(updated);
      setShowCashInOutModal(null);
      setCashInOutAmount(5000);
      setCashInOutReason('');
    }
  });

  const createSaleMutation = useMutation({
    mutationFn: (payload: any) => posApi.createSale(payload),
    onSuccess: (res) => {
      // Update local shift sales aggregates
      const updated = { ...activeShift };
      updated.totalSalesCount = (updated.totalSalesCount || 0) + 1;
      updated.totalSalesAmount = (updated.totalSalesAmount || 0) + res.data.totalAmount;
      setActiveShift(updated);
      setShowSaleModal(false);
      setSaleItems([{ productId: '', quantity: 1, price: 0 }]);
      alert('Продажа успешно проведена! Чек зафискализирован в ОФД.');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Ошибка проведения продажи. Проверьте остаток на складе.');
    }
  });

  const handleSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;

    const payload = {
      shiftId: activeShift.shiftId,
      items: saleItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      paymentMethod,
      cashReceived: paymentMethod === 'CASH' ? saleItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0) : 0
    };

    createSaleMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Кассовый модуль (POS)</h2>
        <p className="text-sm text-gray-500">Управление кассовыми сменами, внесением средств, продажами и Z-отчётами</p>
      </div>

      {!activeShift ? (
        /* Open Shift Layout */
        <div className="max-w-md mx-auto bg-white border border-gray-100 rounded-3xl p-8 shadow-md space-y-6">
          <div className="text-center space-y-2">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Store className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Смена закрыта</h3>
            <p className="text-xs text-gray-400">Для начала работы и проведения продаж откройте новую смену</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Идентификатор терминала</label>
              <input
                type="text"
                value={terminalId}
                onChange={(e) => setTerminalId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-950"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Начальная сумма в кассе (₸)</label>
              <input
                type="number"
                value={openingCash}
                onChange={(e) => setOpeningCash(parseInt(e.target.value) || 0)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-950"
              />
            </div>

            <button
              onClick={() => openShiftMutation.mutate()}
              disabled={openShiftMutation.isPending}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-sm transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2"
            >
              {openShiftMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4 fill-white" />
              )}
              Открыть смену
            </button>
          </div>
        </div>
      ) : (
        /* Active Shift Dashboard */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shift Details Widget */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                Смена открыта
              </span>
              <span className="text-xs text-gray-400 font-mono">ID: {activeShift.shiftId.slice(0, 8)}</span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-xs text-gray-400 font-medium">Терминал</span>
                <span className="text-sm font-semibold text-gray-900">{activeShift.terminalId}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-xs text-gray-400 font-medium">Начало смены</span>
                <span className="text-sm font-semibold text-gray-900">{new Date(activeShift.openedAt).toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-xs text-gray-400 font-medium">Касса на начало</span>
                <span className="text-sm font-bold text-gray-900">{activeShift.openingCash.toLocaleString()} ₸</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-xs text-gray-400 font-medium">Внесения (Cash In)</span>
                <span className="text-sm font-semibold text-emerald-600">+{activeShift.cashInTotal?.toLocaleString() ?? 0} ₸</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-xs text-gray-400 font-medium">Изъятия (Cash Out)</span>
                <span className="text-sm font-semibold text-rose-600">-{activeShift.cashOutTotal?.toLocaleString() ?? 0} ₸</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-xs text-gray-400 font-medium">Продаж оформлено</span>
                <span className="text-sm font-bold text-blue-600">{activeShift.totalSalesCount ?? 0} чеков</span>
              </div>
            </div>

            {/* Quick Actions inside shift */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowCashInOutModal('in')}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200/60 bg-emerald-50/20 hover:bg-emerald-50 text-emerald-700 font-semibold py-2.5 text-xs transition-all"
              >
                <PlusCircle className="h-4 w-4" /> Внесение
              </button>
              <button
                onClick={() => setShowCashInOutModal('out')}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200/60 bg-rose-50/20 hover:bg-rose-50 text-rose-700 font-semibold py-2.5 text-xs transition-all"
              >
                <MinusCircle className="h-4 w-4" /> Изъятие
              </button>
            </div>
          </div>

          {/* Quick Cashier Checkout Simulation panel */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Симулятор продаж (POS)</h3>
                <p className="text-xs text-gray-500">Симуляция пробития товара, оплаты и печати фискального чека</p>
              </div>
              <button
                onClick={() => setShowSaleModal(true)}
                className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 text-xs shadow-md shadow-blue-500/10 transition-all"
              >
                <ShoppingBag className="h-4 w-4" /> Новая продажа
              </button>
            </div>

            {/* Shift Sales Totals summary card */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white relative overflow-hidden border border-white/5 shadow-lg shadow-slate-900/10">
              <div className="absolute top-[-50%] right-[-10%] w-[200px] h-[200px] rounded-full bg-blue-500/10 blur-[80px]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Сумма продаж смены</span>
              <h4 className="text-3xl font-black mt-1">
                {activeShift.totalSalesAmount?.toLocaleString() ?? 0} ₸
              </h4>
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> Все чеки автоматически фискализированы ОФД
              </p>
            </div>

            {/* Close Shift panel */}
            <div className="border-t border-gray-100 pt-6 space-y-4">
              <h4 className="font-bold text-gray-950 text-sm">Закрытие смены (Z-отчёт)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Фактическая сумма в сейфе (₸)</label>
                  <input
                    type="number"
                    value={closingCash}
                    onChange={(e) => setClosingCash(parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Примечание</label>
                  <input
                    type="text"
                    value={shiftNote}
                    placeholder="Напр. Излишков нет"
                    onChange={(e) => setShiftNote(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-950"
                  />
                </div>
              </div>

              <button
                onClick={() => closeShiftMutation.mutate()}
                disabled={closeShiftMutation.isPending}
                className="w-full rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold py-3 text-sm transition-all shadow-md shadow-red-500/10 flex items-center justify-center gap-2"
              >
                {closeShiftMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Закрыть смену и получить Z-отчёт
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sale Simulation Dialog */}
      {showSaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/30 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Симуляция чека POS</h3>
              <button onClick={() => setShowSaleModal(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaleSubmit} className="p-6 space-y-5">
              {saleItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-3 items-end">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Товар</label>
                    <select
                      required
                      value={item.productId}
                      onChange={(e) => {
                        const targetId = e.target.value;
                        const prod = products?.data?.find((x: any) => x.id === targetId);
                        const updated = [...saleItems];
                        updated[idx] = {
                          productId: targetId,
                          quantity: item.quantity,
                          price: prod?.prices?.[0]?.value || 0
                        };
                        setSaleItems(updated);
                      }}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-950"
                    >
                      <option value="">Выберите товар</option>
                      {products?.data?.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.prices?.[0]?.value || 0} ₸)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Кол-во</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const updated = [...saleItems];
                        updated[idx].quantity = parseInt(e.target.value) || 1;
                        setSaleItems(updated);
                      }}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-950"
                    />
                  </div>
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Метод оплаты</label>
                <select
                  value={paymentMethod}
                  onChange={(e: any) => setPaymentMethod(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-950"
                >
                  <option value="CASH">Наличные (CASH)</option>
                  <option value="CARD">Банковская карта (CARD)</option>
                  <option value="KASPI_PAY">Kaspi Pay (Счет на кассу)</option>
                  <option value="QR">Kaspi QR (Оплата QR-кодом)</option>
                </select>
              </div>

              {/* Totals */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex justify-between items-center font-bold text-gray-900">
                <span>Итого к оплате:</span>
                <span className="text-lg text-blue-600">
                  {saleItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0).toLocaleString()} ₸
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowSaleModal(false)}
                  className="rounded-xl border border-gray-200 py-2.5 px-4 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={createSaleMutation.isPending}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 text-sm transition-all shadow-md shadow-blue-500/10 flex items-center gap-2"
                >
                  {createSaleMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Оплатить чек
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cash In / Out Dialog */}
      {showCashInOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/20 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 border border-gray-100 space-y-4">
            <h4 className="font-bold text-gray-950 text-base">
              {showCashInOutModal === 'in' ? 'Внесение наличных' : 'Изымание средств (Инкассация)'}
            </h4>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Сумма (₸)</label>
              <input
                type="number"
                value={cashInOutAmount}
                onChange={(e) => setCashInOutAmount(parseInt(e.target.value) || 0)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-950"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Обоснование / Причина</label>
              <input
                type="text"
                value={cashInOutReason}
                onChange={(e) => setCashInOutReason(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-950"
                placeholder={showCashInOutModal === 'in' ? 'Напр. Разменная монета' : 'Напр. Инкассация в банк'}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCashInOutModal(null)}
                className="rounded-lg border border-gray-200 py-1.5 px-3 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => cashInOutMutation.mutate({ type: showCashInOutModal, amount: cashInOutAmount, reason: cashInOutReason })}
                disabled={cashInOutMutation.isPending}
                className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-3.5 text-xs transition-all flex items-center gap-1"
              >
                {cashInOutMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Провести
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
