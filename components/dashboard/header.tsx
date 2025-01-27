'use client'

import React from 'react';
import NotificationDropdown from './NotificationDropdown';
import PocketBase from 'pocketbase'

const pb = new PocketBase('http://127.0.0.1:8090')

const currentUser = pb.authStore.model ? pb.authStore.model : null;

const Header: React.FC = () => {
  console.log(pb.authStore);

  return (
    <header className="flex items-center justify-between py-4 px-8 ml-12 lg:ml-64">
      <h1 className="text-lg text-gray-800">Bienvenido {typeof currentUser === 'string' ? currentUser : currentUser?.name}</h1>
      <NotificationDropdown />
    </header>
  );
};

export default Header;
