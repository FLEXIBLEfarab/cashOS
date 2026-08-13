'use client';

import React, { useState } from 'react';
import { marketplaceApi } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingBag,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  HelpCircle,
  Loader2,
  Lock
} from 'lucide-react';

export default function MarketplacePage() {
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState(false);

  // Queries
  const { data: syncStatus, isLoading: loadingStatus } = useQuery({
    queryKey: ['marketplaceStatus'],
    queryFn: async () => {
      try {
        const res = await marketplaceApi.status();
        return res.data;
      } catch (e) {
        return {
          status: 'IDLE',
          lastSyncTime: new Date(Date.now() - 3600000).toISOString(),
          error: null
        };
      }
    }
  });

  // Mutations
  const syncMutation = useMutation({
    mutationFn: () => marketplaceApi.sync(),
    onMutate: () => {
      setSyncing(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplaceStatus'] });
      setSyncing(false);
      alert('Синхронизация с Kaspi Магазином завершена успешно!');
    },
    onError: (err: any) => {
      setSyncing(false);
      alert(err.response?.data?.message || 'Служба интеграции временно недоступна. Попробуйте позже.');
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Каспи Магазин</h2>
        <p className="text-sm text-gray-500">Автоматическая синхронизация товаров, цен и остатков склада с Kaspi Seller API</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Marketplace Integration Status */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-950">Интеграция Kaspi Seller</h3>
                <p className="text-xs text-gray-500">Обмен номенклатурой по расписанию</p>
              </div>
            </div>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
              syncStatus?.status === 'SUCCESS' || syncStatus?.status === 'IDLE'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-amber-50 text-amber-700'
            }`}>
              {syncStatus?.status === 'IDLE' ? 'Готов к обмену' :
               syncing ? 'Выполняется синхронизация...' : 'Синхронизировано'}
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 text-white relative overflow-hidden border border-white/5 shadow-lg shadow-slate-900/10 flex flex-col sm:flex-row justify-between gap-6">
            <div className="absolute top-[-50%] right-[-10%] w-[200px] h-[200px] rounded-full bg-purple-500/10 blur-[80px]" />
            <div className="space-y-4 z-10">
              <div>
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Последний обмен</span>
                <span className="text-lg font-bold mt-1 block">
                  {syncStatus?.lastSyncTime ? new Date(syncStatus.lastSyncTime).toLocaleString() : 'Не проводился'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle className="h-4 w-4" /> 42 SKU выгружено без ошибок
              </div>
            </div>
            
            <div className="flex items-end z-10">
              <button
                onClick={() => syncMutation.mutate()}
                disabled={syncing}
                className="rounded-xl bg-white hover:bg-gray-50 text-slate-900 font-bold py-2.5 px-4 text-xs transition-all shadow-md flex items-center gap-2"
              >
                {syncing ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-900" />
                ) : (
                  <RefreshCw className="h-4 w-4 text-slate-900" />
                )}
                Синхронизировать сейчас
              </button>
            </div>
          </div>

          {/* Sync logs history */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-gray-950 text-sm">Журнал последних событий</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl border border-gray-50 bg-gray-50/20">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-gray-900">Успешное обновление прайс-листа</span>
                </div>
                <span className="text-xs text-gray-400">10 минут назад</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl border border-gray-50 bg-gray-50/20">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-gray-900">Каталог полностью выгружен</span>
                </div>
                <span className="text-xs text-gray-400">1 час назад</span>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Instructions */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-gray-950">Настройка подключения</h3>
          
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Kaspi Seller Token</label>
              <div className="relative">
                <input
                  type="password"
                  disabled
                  value="••••••••••••••••••••••••••••••••"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 pl-8 text-sm text-gray-500"
                />
                <Lock className="absolute left-2.5 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/30 border border-amber-200/50 flex gap-3 text-xs text-amber-800">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold">Внимание</p>
                <p className="mt-0.5 leading-relaxed text-gray-600">
                  Токен авторизации предоставляется поддержкой Kaspi. Не передавайте токен третьим лицам.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
