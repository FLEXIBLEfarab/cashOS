'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  Warehouse,
  ShoppingBag as MarketplaceIcon,
  LogOut,
  Menu,
  X,
  User,
  Activity
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/products', label: 'Товары и Цены', icon: ShoppingBag },
  { href: '/pos', label: 'Кассовые Смены', icon: Store },
  { href: '/wms', label: 'Управление WMS', icon: Warehouse },
  { href: '/marketplace', label: 'Каспи Магазин', icon: MarketplaceIcon },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-gray-200/80 lg:bg-white lg:p-6 lg:fixed lg:h-full lg:z-30">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 shadow-md shadow-blue-500/10">
            <span className="text-lg font-bold text-white">Ч</span>
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight text-gray-900">Четка OS</h1>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">SaaS Казахстан</span>
          </div>
        </div>

        <nav className="mt-8 flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Footer Profile */}
        <div className="mt-auto border-t border-gray-100 pt-4 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'Администратор'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role === 'admin' ? 'Владелец сети' : 'Сотрудник'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all"
          >
            <LogOut className="h-5 w-5 text-red-500" />
            Выйти из системы
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200/80 bg-white/80 backdrop-blur px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Подключение активно</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-500 font-medium">Текущий филиал</p>
              <p className="text-sm font-semibold text-gray-950">Центральный склад (Алматы)</p>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-gray-950/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
            <aside className="w-72 bg-white h-full p-6 flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 text-white font-bold">
                    Ч
                  </div>
                  <h1 className="text-base font-bold text-gray-950">Четка OS</h1>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1 rounded-md hover:bg-gray-100 text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="mt-8 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto border-t border-gray-100 pt-4 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-950 truncate">{user?.name || 'Администратор'}</p>
                    <p className="text-xs text-gray-500">Администратор</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                >
                  <LogOut className="h-5 w-5" />
                  Выйти из системы
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Protected Page Content */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
