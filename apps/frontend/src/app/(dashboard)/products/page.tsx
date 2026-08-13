'use client';

import React, { useState } from 'react';
import { productsApi, categoriesApi, brandsApi, unitsApi, taxesApi } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  Layers,
  Sparkles,
  Barcode as BarcodeIcon,
  Tag,
  Loader2,
  Filter,
  CheckCircle,
  X
} from 'lucide-react';

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Quick modals state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');

  // Main product form state
  const [form, setForm] = useState({
    name: '',
    sku: '',
    description: '',
    category_id: '',
    brand_id: '',
    unit_id: '',
    tax_id: '',
    purchase_price: 0,
    weight: 0,
    weight_unit: 'kg',
    barcodes: [{ code: '', type: 'EAN13', is_primary: true }],
    prices: [{ value: 0, branch_id: null, is_active: true }],
    stock_info: [{ branch_id: null, warehouse_id: null, quantity: 0, min_quantity: 5 }]
  });

  // Queries
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['products', search, selectedCategory, page],
    queryFn: async () => {
      const res = await productsApi.getAll({
        search: search || undefined,
        category_id: selectedCategory || undefined,
        page,
        limit: 10
      });
      return res.data;
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await categoriesApi.getAll();
      return res.data;
    }
  });

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const res = await brandsApi.getAll();
      return res.data;
    }
  });

  const { data: units } = useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      const res = await unitsApi.getAll();
      return res.data;
    }
  });

  const { data: taxes } = useQuery({
    queryKey: ['taxes'],
    queryFn: async () => {
      const res = await taxesApi.getAll();
      return res.data;
    }
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: (data: any) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['wmsDashboard'] });
      setShowModal(false);
      resetForm();
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => productsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowModal(false);
      setEditingId(null);
      resetForm();
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['wmsDashboard'] });
    }
  });

  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => categoriesApi.create({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowCategoryModal(false);
      setNewCategoryName('');
    }
  });

  const createBrandMutation = useMutation({
    mutationFn: (name: string) => brandsApi.create({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      setShowBrandModal(false);
      setNewBrandName('');
    }
  });

  // Helpers
  const resetForm = () => {
    setForm({
      name: '',
      sku: '',
      description: '',
      category_id: '',
      brand_id: '',
      unit_id: '',
      tax_id: '',
      purchase_price: 0,
      weight: 0,
      weight_unit: 'kg',
      barcodes: [{ code: '', type: 'EAN13', is_primary: true }],
      prices: [{ value: 0, branch_id: null, is_active: true }],
      stock_info: [{ branch_id: null, warehouse_id: null, quantity: 0, min_quantity: 5 }]
    });
  };

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      sku: p.sku,
      description: p.description || '',
      category_id: p.category?.id || '',
      brand_id: p.brand?.id || '',
      unit_id: p.unit?.id || '',
      tax_id: p.tax?.id || '',
      purchase_price: p.purchase_price,
      weight: p.weight || 0,
      weight_unit: p.weight_unit || 'kg',
      barcodes: p.barcodes?.length ? p.barcodes.map((b: any) => ({ code: b.code, type: b.type, is_primary: b.is_primary })) : [{ code: '', type: 'EAN13', is_primary: true }],
      prices: p.prices?.length ? p.prices.map((pr: any) => ({ value: pr.value, branch_id: pr.branch_id, is_active: pr.is_active })) : [{ value: 0, branch_id: null, is_active: true }],
      stock_info: p.stock_info?.length ? p.stock_info.map((s: any) => ({ branch_id: s.branch_id, warehouse_id: s.warehouse_id, quantity: s.quantity, min_quantity: s.min_quantity })) : [{ branch_id: null, warehouse_id: null, quantity: 0, min_quantity: 5 }]
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanForm = {
      ...form,
      category_id: form.category_id || null,
      brand_id: form.brand_id || null,
      unit_id: form.unit_id || null,
      tax_id: form.tax_id || null,
      barcodes: form.barcodes.filter((b) => b.code),
      prices: form.prices.filter((p) => p.value > 0),
      stock_info: form.stock_info
    };

    if (editingId) {
      updateProductMutation.mutate({ id: editingId, data: cleanForm });
    } else {
      createProductMutation.mutate(cleanForm);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Каталог товаров</h2>
          <p className="text-sm text-gray-500">Управление товарным каталогом, категориями, ценами и штрихкодами</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 text-sm shadow-md shadow-blue-500/10 transition-all"
        >
          <Plus className="h-4 w-4" /> Добавить товар
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-stretch">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по названию или SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-900"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative min-w-[180px]">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-900 appearance-none"
            >
              <option value="">Все категории</option>
              {categories?.data?.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main product table */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        {loadingProducts ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : productsData?.data?.data?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs font-semibold uppercase tracking-wider bg-gray-50/30">
                  <th className="py-4 px-6">Товар</th>
                  <th className="py-4 px-6">Категория / Бренд</th>
                  <th className="py-4 px-6">Цена закупки</th>
                  <th className="py-4 px-6">Цена продажи</th>
                  <th className="py-4 px-6">Штрихкод</th>
                  <th className="py-4 px-6 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {productsData.data.data.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50/40 transition-all">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">SKU: {p.sku}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-950 font-medium">{p.category?.name || '—'}</div>
                      <div className="text-xs text-gray-400">{p.brand?.name || '—'}</div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-900">
                      {p.purchase_price?.toLocaleString()} ₸
                    </td>
                    <td className="py-4 px-6 font-bold text-blue-600">
                      {p.prices?.[0]?.value ? `${p.prices[0].value.toLocaleString()} ₸` : 'Не установлена'}
                    </td>
                    <td className="py-4 px-6">
                      {p.barcodes?.[0]?.code ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 border border-gray-200/50">
                          <BarcodeIcon className="h-3 w-3" /> {p.barcodes[0].code}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Нет</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50/50 transition-all"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Вы уверены, что хотите удалить этот товар?')) {
                              deleteProductMutation.mutate(p.id);
                            }
                          }}
                          className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50/50 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 space-y-3">
            <Package className="h-12 w-12 text-gray-300 mx-auto" />
            <h4 className="text-base font-semibold text-gray-900">Каталог пуст</h4>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">Добавьте первый товар кнопкой «Добавить товар»</p>
          </div>
        )}

        {/* Pagination */}
        {productsData?.data?.meta && productsData.data.meta.total > 10 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50/10">
            <span className="text-xs text-gray-500">
              Показано {((page - 1) * 10) + 1} - {Math.min(page * 10, productsData.data.meta.total)} из {productsData.data.meta.total}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Назад
              </button>
              <button
                disabled={page * 10 >= productsData.data.meta.total}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Далее
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main product dialog modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/30 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? 'Редактировать товар' : 'Добавить товар'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Product name & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Название товара *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-950"
                    placeholder="Напр. Хлеб Бородинский"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Артикул / SKU *</label>
                  <input
                    type="text"
                    required
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-950"
                    placeholder="Напр. SKU-1002"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Описание</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-950"
                  rows={2}
                  placeholder="Дополнительные характеристики товара..."
                />
              </div>

              {/* Select Category & Brand dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Категория</label>
                    <button
                      type="button"
                      onClick={() => setShowCategoryModal(true)}
                      className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"
                    >
                      + Создать
                    </button>
                  </div>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-950"
                  >
                    <option value="">Без категории</option>
                    {categories?.data?.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Бренд</label>
                    <button
                      type="button"
                      onClick={() => setShowBrandModal(true)}
                      className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"
                    >
                      + Создать
                    </button>
                  </div>
                  <select
                    value={form.brand_id}
                    onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-950"
                  >
                    <option value="">Без бренда</option>
                    {brands?.data?.map((b: any) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Purchase price and Sell price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Цена закупки (₸)</label>
                  <input
                    type="number"
                    value={form.purchase_price}
                    onChange={(e) => setForm({ ...form, purchase_price: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Цена продажи (₸)</label>
                  <input
                    type="number"
                    value={form.prices[0]?.value || 0}
                    onChange={(e) => {
                      const updatedPrices = [...form.prices];
                      updatedPrices[0] = { ...updatedPrices[0], value: parseFloat(e.target.value) || 0 };
                      setForm({ ...form, prices: updatedPrices });
                    }}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-950"
                  />
                </div>
              </div>

              {/* Barcode settings */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Штрихкод</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={form.barcodes[0]?.code || ''}
                    onChange={(e) => {
                      const updatedBarcodes = [...form.barcodes];
                      updatedBarcodes[0] = { ...updatedBarcodes[0], code: e.target.value };
                      setForm({ ...form, barcodes: updatedBarcodes });
                    }}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-950"
                    placeholder="Напр. 4601234567890"
                  />
                  <select
                    value={form.barcodes[0]?.type || 'EAN13'}
                    onChange={(e) => {
                      const updatedBarcodes = [...form.barcodes];
                      updatedBarcodes[0] = { ...updatedBarcodes[0], type: e.target.value };
                      setForm({ ...form, barcodes: updatedBarcodes });
                    }}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-950"
                  >
                    <option value="EAN13">EAN13</option>
                    <option value="EAN8">EAN8</option>
                    <option value="CODE128">CODE128</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-gray-200 py-2.5 px-4 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={createProductMutation.isPending || updateProductMutation.isPending}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 text-sm transition-all shadow-md shadow-blue-500/10 flex items-center gap-2"
                >
                  {(createProductMutation.isPending || updateProductMutation.isPending) && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Quick Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/20 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h4 className="font-bold text-gray-950 text-base mb-4">Создать категорию</h4>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-950 mb-4"
              placeholder="Название категории"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="rounded-lg border border-gray-200 py-1.5 px-3 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => createCategoryMutation.mutate(newCategoryName)}
                className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-3.5 text-xs transition-all"
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Brand Quick Modal */}
      {showBrandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/20 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h4 className="font-bold text-gray-950 text-base mb-4">Создать бренд</h4>
            <input
              type="text"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-950 mb-4"
              placeholder="Название бренда"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBrandModal(false)}
                className="rounded-lg border border-gray-200 py-1.5 px-3 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => createBrandMutation.mutate(newBrandName)}
                className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-3.5 text-xs transition-all"
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
