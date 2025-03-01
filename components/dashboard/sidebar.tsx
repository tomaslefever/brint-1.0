'use client'

import React from 'react';
import Link from 'next/link';
import { Bell, Home, Package, Users, Settings, FileText, Sun, Moon, LogOut, Contact, Building2, CloudUpload, Menu, X } from "lucide-react";
import Image from 'next/image';

import PocketBase from 'pocketbase'
const pb = new PocketBase('https://pb.innovalignersapp.cl/')

const Sidebar: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [userRole, setUserRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Verificar el rol del usuario solo en el cliente
    setUserRole(pb.authStore.model?.role || null);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark', !isDarkMode);
  };

  const handleLogout = () => {
    pb.authStore.clear();
    localStorage.removeItem('authToken'); // Elimina el authToken del localStorage
    window.location.href = '/';
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`lg:hidden fixed top-4 left-8 z-10 p-2 rounded bg-white dark:bg-gray-800 shadow-lg`}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        w-64 bg-white dark:bg-gray-800 p-4 h-screen fixed top-0 left-0 
        flex flex-col justify-between z-40 transition-transform duration-300
        lg:translate-x-0 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <nav className="space-y-2">
          <div className="flex items-center mb-6">
              <Image src="/img/logo.png" alt="Logo" width={200} height={100} />
          </div>
          <Link onClick={() => setIsOpen(false)} prefetch={true} href="/dashboard" className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md">
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          {/* <Link onClick={() => setIsOpen(false)} prefetch={true} href="/dashboard/customers" className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md">
            <Contact className="h-5 w-5" />
            <span>Pacientes</span>
          </Link> */}
          <Link onClick={() => setIsOpen(false)} prefetch={true} href="/dashboard/orders" className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md">
            <Package className="h-5 w-5" />
            <span>Órdenes</span>
          </Link>
          {/* {userRole === 'admin' && (
            <Link onClick={() => setIsOpen(false)} prefetch={true} href="/dashboard/files" className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md">
              <CloudUpload className="h-5 w-5" />
            <span>Archivos</span>
          </Link>
          )} */}
          {userRole === 'admin' && (
          <Link onClick={() => setIsOpen(false)} prefetch={true} href="/dashboard/users" className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md">
            <Users className="h-5 w-5" />
            <span>Doctores</span>
          </Link>
          )}
          <Link onClick={() => setIsOpen(false)} prefetch={true} href="/dashboard/companies" className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md">
            <Building2 className="h-5 w-5" />
            <span>Organizaciones</span>
          </Link>
          
          <Link onClick={() => setIsOpen(false)} prefetch={true} href="/dashboard/settings" className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md">
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
    </>
  );
};

export default Sidebar;
