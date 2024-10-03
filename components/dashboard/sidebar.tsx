'use client'

import React from 'react';
import Link from 'next/link';
import { Bell, Home, Package, Users, Settings, FileText, Sun, Moon, LogOut } from "lucide-react";
import Image from 'next/image';

import PocketBase from 'pocketbase'
const pb = new PocketBase('http://127.0.0.1:8090')

const Sidebar: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark', !isDarkMode);
  };

  const handleLogout = () => {
    pb.authStore.clear();
    window.location.href = '/';
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 p-4 h-screen fixed top-0 left-0 flex flex-col justify-between">
      <nav className="space-y-2">
        <div className="flex items-center mb-6">
            <Image src="/img/logo.png" alt="Logo" width={200} height={100} />
        </div>
        <Link href="/dashboard" className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md">
          <Home className="h-5 w-5" />
          <span>Dashboard</span>
        </Link>
        <Link href="/dashboard/orders" className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md">
          <Package className="h-5 w-5" />
          <span>Órdenes</span>
        </Link>
        <Link href="/dashboard/files" className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md">
          <FileText className="h-5 w-5" />
          <span>Archivos</span>
        </Link>
        <Link href="/dashboard/customers" className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md">
          <Users className="h-5 w-5" />
          <span>Pacientes</span>
        </Link>
        <Link href="/dashboard/users" className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md">
          <Users className="h-5 w-5" />
          <span>Usuarios</span>
        </Link>
        <Link href="/dashboard/settings" className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md">
          <Settings className="h-5 w-5" />
          <span>Configuración</span>
        </Link>
      </nav>
      <div className="gap-4 border-t-2 pt-4 flex items-center">
        <button onClick={toggleTheme} className="flex border items-center space-x-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md">
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button onClick={handleLogout} className="flex border items-center space-x-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md">
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
