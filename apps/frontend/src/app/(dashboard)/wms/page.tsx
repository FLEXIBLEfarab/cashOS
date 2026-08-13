'use client';

import React, { useState } from 'react';
import { wmsApi, productsApi } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Warehouse,
  History,
  AlertTriangle,
  Tags,
  Calendar,
  Layers,
  Plus,
  Loader2,
  CheckCircle2,
  XCircle,
  Truck,
  Trash2
} from 'lucide-react';

export default function WmsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'stocks' | 'movements' | 'pricing' | 'preorders' | 'expiring'>('stocks');

  // Pricing Form State
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [pricingForm, setPricingForm] = useState({
    productId: '',
    warehouseId: '',
    name: 'Сезонная распродажа',
    price: 0,
    startDate: '',
    endDate: ''
  });

  // Pre-Order Form State
  const [showPreOrderModal, setShowPreOrderModal] = useState(false);
  const [preOrderForm, setPreOrderForm] = useState({
    productId: '',
    warehouseId: '',
    customerReference: '',
    quantity: 1,
    requestedDate: '',
    notes: ''
  });

  // Queries
  const { data: warehouses } = useQuery({
    queryKey: ['warehousesList'],
    queryFn: async () => {
      const res = await wmsApi.getWarehouses();
      return res.data;
    }
  });

  const { data: products } = useQuery({
    queryKey: ['wmsProductsList'],
    queryFn: async () => {
      const res = await productsApi.getAll({ limit: 100 });
      return res.data;
    }
  });

  const { data: stocks, isLoading: loadingStocks } = useQuery({
    queryKey: ['wmsStocks', activeTab],
    queryFn: async () => {
      try {
        const res = await wmsApi.getStocks();
        return res.data;
      } catch (e) {
        return [];
      }
    },
    enabled: activeTab === 'stocks'
  });

  const { data: movements, isLoading: loadingMovements } = useQuery({
    queryKey: ['wmsMovements', activeTab],
    queryFn: async () => {
      try {
        const res = await wmsApi.getMovements();
        return res.data;
      } catch (e) {
        return [];
      }
    },
    enabled: activeTab === 'movements'
  });

  const { data: seasonalPrices, isLoading: loadingPrices } = useQuery({
    queryKey: ['seasonalPrices', activeTab],
    queryFn: async () => {
      try {
        const res = await wmsApi.getSeasonalPrices();
        return res.data;
      } catch (e) {
        return [];
      }
    },
    enabled: activeTab === 'pricing'
  });

  const { data: preOrders, isLoading: loadingPreorders } = useQuery({
    queryKey: ['wmsPreorders', activeTab],
    queryFn: async () => {
      try {
        const res = await wmsApi.getPreorders();
        return res.data;
      } catch (e) {
        return [];
      }
    },
    enabled: activeTab === 'preorders'
  });

  const { data: expiringStocks, isLoading: loadingExpiring } = useQuery({
    queryKey: ['wmsExpiring', activeTab],
    queryFn: async () => {
      try {
        const res = await wmsApi.getExpiringStocks({ days: 30 });
        return res.data;
      } catch (e) {
        return [];
      }
    },
    enabled: activeTab === 'expiring'
  });

  // Mutations
  const createPricingMutation = useMutation({
    mutationFn: (data: any) => wmsApi.createSeasonalPrice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seasonalPrices'] });
      setShowPricingModal(false);
      setPricingForm({ productId: '', warehouseId: '', name: 'Сезонная распродажа', price: 0, startDate: '', endDate: '' });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Ошибка создания прайс-листа. Проверьте правильность заполнения.');
    }
  });

  const createPreOrderMutation = useMutation({
    mutationFn: (data: any) => wmsApi.createPreorder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wmsPreorders'] });
      setShowPreOrderModal(false);
      setPreOrderForm({ productId: '', warehouseId: '', customerReference: '', quantity: 1, requestedDate: '', notes: '' });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Ошибка создания предзаказа.');
    }
  });

  const updatePreOrderStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: number }) => wmsApi.updatePreorderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wmsPreorders'] });
    }
  });

  const handlePricingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPricingMutation.mutate({
      ...pricingForm,
      warehouseId: pricingForm.warehouseId || null,
      price: parseFloat(pricingForm.price as any) || 0
    });
  };

  const handlePreOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPreOrderMutation.mutate({
      ...preOrderForm,
      quantity: parseFloat(preOrderForm.quantity as any) || 1
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Управление WMS</h2>
          <p className="text-sm text-gray-500">Складской микросервис: остатки, партии, сезонные цены и предзаказы</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'pricing' && (
            <button
              onClick={() => setShowPricingModal(true)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 text-sm shadow-md shadow-blue-500/10 transition-all"
            >
              <Plus className="h-4 w-4" /> Сезонная цена
            </button>
          )}
          {activeTab === 'preorders' && (
            <button
              onClick={() => setShowPreOrderModal(true)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 text-sm shadow-md shadow-blue-500/10 transition-all"
            >
              <Plus className="h-4 w-4" /> Новый предзаказ
            </button>
          )}
        </div>
      </div>

      {/* Tabs list navigation */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('stocks')}
          className={`flex items-center gap-2 pb-4 px-4 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'stocks'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Warehouse className="h-4 w-4" /> Остатки
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={`flex items-center gap-2 pb-4 px-4 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'movements'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <History className="h-4 w-4" /> История движений
        </button>
        <button
          onClick={() => setActiveTab('expiring')}
          className={`flex items-center gap-2 pb-4 px-4 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'expiring'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <AlertTriangle className="h-4 w-4" /> Контроль сроков
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center gap-2 pb-4 px-4 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'pricing'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Tags className="h-4 w-4" /> Сезонные цены
        </button>
        <button
          onClick={() => setActiveTab('preorders')}
          className={`flex items-center gap-2 pb-4 px-4 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'preorders'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Truck className="h-4 w-4" /> Предзаказы
        </button>
      </div>

      {/* Tab Panels Contents */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        {/* Panel 1: Warehouse Stocks */}
        {activeTab === 'stocks' && (
          <div className="space-y-4">
            {loadingStocks ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : stocks && stocks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 text-xs font-semibold uppercase bg-gray-50/20">
                      <th className="py-3 px-4">Товар</th>
                      <th className="py-3 px-4">Склад</th>
                      <th className="py-3 px-4 text-right">В наличии</th>
                      <th className="py-3 px-4 text-right">Зарезервировано</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {stocks.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50/40">
                        <td className="py-3 px-4 font-semibold text-gray-900">{item.productName}</td>
                        <td className="py-3 px-4">{item.warehouseName}</td>
                        <td className="py-3 px-4 text-right text-gray-900 font-bold">{item.quantity} шт</td>
                        <td className="py-3 px-4 text-right text-gray-500">{item.reservedQuantity || 0} шт</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">Остатки не загружены. Для наполнения склада проведите тестовые приемки.</div>
            )}
          </div>
        )}

        {/* Panel 2: Stock Movements log */}
        {activeTab === 'movements' && (
          <div className="space-y-4">
            {loadingMovements ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : movements && movements.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 text-xs font-semibold uppercase bg-gray-50/20">
                      <th className="py-3 px-4">Дата / Исполнитель</th>
                      <th className="py-3 px-4">Тип / Документ</th>
                      <th className="py-3 px-4">Товар</th>
                      <th className="py-3 px-4 text-right">Количество</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {movements.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50/40">
                        <td className="py-3 px-4">
                          <div className="text-gray-900 font-medium">{new Date(item.performedAt).toLocaleString()}</div>
                          <div className="text-xs text-gray-400">Исполнитель: {item.performedBy || 'Система'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${
                            item.movementType === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {item.movementType === 0 ? 'Приход' : 'Списание'}
                          </span>
                          <div className="text-xs text-gray-400 mt-1">Док: {item.documentId}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-900">{item.productName || 'Товар'}</td>
                        <td className="py-3 px-4 text-right text-gray-900 font-bold">{item.quantity} шт</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">Лог движений пуст. Проведите приходную накладную или списание.</div>
            )}
          </div>
        )}

        {/* Panel 3: Expiration checks */}
        {activeTab === 'expiring' && (
          <div className="space-y-4">
            {loadingExpiring ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : expiringStocks && expiringStocks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 text-xs font-semibold uppercase bg-gray-50/20">
                      <th className="py-3 px-4">Товар</th>
                      <th className="py-3 px-4">Склад</th>
                      <th className="py-3 px-4">Партия</th>
                      <th className="py-3 px-4 text-right">Дней осталось</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {expiringStocks.map((item: any, idx: number) => {
                      const isExpired = item.daysRemaining <= 0;
                      return (
                        <tr key={idx} className="hover:bg-gray-50/40">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-gray-900">{item.productName}</div>
                            <div className="text-xs text-gray-400">Остаток: {item.quantity} шт</div>
                          </td>
                          <td className="py-3 px-4">{item.warehouseName || 'Главный'}</td>
                          <td className="py-3 px-4 font-mono text-xs">{item.batchNumber}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              isExpired ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {isExpired ? 'Просрочен' : `${item.daysRemaining} дней`}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">Просроченных или истекающих товаров на складах нет.</div>
            )}
          </div>
        )}

        {/* Panel 4: Seasonal pricing lists */}
        {activeTab === 'pricing' && (
          <div className="space-y-4">
            {loadingPrices ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : seasonalPrices && seasonalPrices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 text-xs font-semibold uppercase bg-gray-50/20">
                      <th className="py-3 px-4">Название / Период действия</th>
                      <th className="py-3 px-4">Товар</th>
                      <th className="py-3 px-4">Склад</th>
                      <th className="py-3 px-4 text-right">Сезонная цена</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {seasonalPrices.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50/40">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">{item.productName || 'Любой'}</td>
                        <td className="py-3 px-4">{item.warehouseName || 'Все склады'}</td>
                        <td className="py-3 px-4 text-right text-blue-600 font-bold">{item.price?.toLocaleString()} ₸</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">Сезонные прайс-листы еще не настроены. Создайте первый кнопкой выше.</div>
            )}
          </div>
        )}

        {/* Panel 5: Pre-Orders list */}
        {activeTab === 'preorders' && (
          <div className="space-y-4">
            {loadingPreorders ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : preOrders && preOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 text-xs font-semibold uppercase bg-gray-50/20">
                      <th className="py-3 px-4">Заказчик / Дата</th>
                      <th className="py-3 px-4">Товар</th>
                      <th className="py-3 px-4 text-right">Кол-во</th>
                      <th className="py-3 px-4">Статус</th>
                      <th className="py-3 px-4 text-right">Изменить статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {preOrders.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50/40">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-900">{item.customerReference}</div>
                          <div className="text-xs text-gray-400">Срок: {new Date(item.requestedDate).toLocaleDateString()}</div>
                        </td>
                        <td className="py-3 px-4">{item.productName}</td>
                        <td className="py-3 px-4 text-right text-gray-900 font-semibold">{item.quantity} шт</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            item.status === 0 ? 'bg-gray-100 text-gray-700' :
                            item.status === 1 ? 'bg-blue-50 text-blue-700' :
                            item.status === 2 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {item.status === 0 ? 'Ожидание' :
                             item.status === 1 ? 'Подтвержден' :
                             item.status === 2 ? 'Выполнен' : 'Отменен'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            {item.status === 0 && (
                              <button
                                onClick={() => updatePreOrderStatusMutation.mutate({ id: item.id, status: 1 })}
                                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-md"
                              >
                                Подтвердить
                              </button>
                            )}
                            {item.status === 1 && (
                              <button
                                onClick={() => updatePreOrderStatusMutation.mutate({ id: item.id, status: 2 })}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-md"
                              >
                                Выполнить
                              </button>
                            )}
                            {item.status < 2 && (
                              <button
                                onClick={() => updatePreOrderStatusMutation.mutate({ id: item.id, status: 3 })}
                                className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-md"
                              >
                                Отменить
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">Предзаказы клиентов не обнаружены. Оформите первый предзаказ.</div>
            )}
          </div>
        )}
      </div>

      {/* Seasonal Pricing Modal Form */}
      {showPricingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/20 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 border border-gray-100 flex flex-col">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
              <h3 className="text-lg font-bold text-gray-950">Создать сезонную цену</h3>
              <button onClick={() => setShowPricingModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePricingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Название акции</label>
                <input
                  type="text"
                  required
                  value={pricingForm.name}
                  onChange={(e) => setPricingForm({ ...pricingForm, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-gray-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Товар</label>
                <select
                  required
                  value={pricingForm.productId}
                  onChange={(e) => setPricingForm({ ...pricingForm, productId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-gray-955 text-gray-950"
                >
                  <option value="">Выберите товар</option>
                  {products?.data?.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Склад (необязательно)</label>
                <select
                  value={pricingForm.warehouseId}
                  onChange={(e) => setPricingForm({ ...pricingForm, warehouseId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-gray-950"
                >
                  <option value="">Все склады</option>
                  {warehouses?.map((w: any) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Сезонная цена (₸)</label>
                <input
                  type="number"
                  required
                  value={pricingForm.price}
                  onChange={(e) => setPricingForm({ ...pricingForm, price: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-gray-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Дата начала</label>
                  <input
                    type="date"
                    required
                    value={pricingForm.startDate}
                    onChange={(e) => setPricingForm({ ...pricingForm, startDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-gray-955 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Дата конца</label>
                  <input
                    type="date"
                    required
                    value={pricingForm.endDate}
                    onChange={(e) => setPricingForm({ ...pricingForm, endDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-gray-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowPricingModal(false)}
                  className="rounded-lg border border-gray-200 py-1.5 px-3.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={createPricingMutation.isPending}
                  className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-4 text-xs transition-all flex items-center gap-1"
                >
                  {createPricingMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Pre-Order Modal Form */}
      {showPreOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/20 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 border border-gray-100 flex flex-col">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
              <h3 className="text-lg font-bold text-gray-950">Оформить предзаказ</h3>
              <button onClick={() => setShowPreOrderModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePreOrderSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Имя / телефон заказчика</label>
                <input
                  type="text"
                  required
                  placeholder="Напр. Азамат +7 777 123 4567"
                  value={preOrderForm.customerReference}
                  onChange={(e) => setPreOrderForm({ ...preOrderForm, customerReference: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-gray-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Товар</label>
                <select
                  required
                  value={preOrderForm.productId}
                  onChange={(e) => setPreOrderForm({ ...preOrderForm, productId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-gray-950"
                >
                  <option value="">Выберите товар</option>
                  {products?.data?.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Склад назначения</label>
                <select
                  required
                  value={preOrderForm.warehouseId}
                  onChange={(e) => setPreOrderForm({ ...preOrderForm, warehouseId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-gray-955 text-gray-905 text-gray-900"
                >
                  <option value="">Выберите склад</option>
                  {warehouses?.map((w: any) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Количество (шт)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={preOrderForm.quantity}
                    onChange={(e) => setPreOrderForm({ ...preOrderForm, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-gray-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Срок выполнения</label>
                  <input
                    type="date"
                    required
                    value={preOrderForm.requestedDate}
                    onChange={(e) => setPreOrderForm({ ...preOrderForm, requestedDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Заметки к заказу</label>
                <textarea
                  value={preOrderForm.notes}
                  onChange={(e) => setPreOrderForm({ ...preOrderForm, notes: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-gray-950"
                  rows={2}
                  placeholder="Дополнительные пожелания клиента..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowPreOrderModal(false)}
                  className="rounded-lg border border-gray-200 py-1.5 px-3.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={createPreOrderMutation.isPending}
                  className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-4 text-xs transition-all flex items-center gap-1"
                >
                  {createPreOrderMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
