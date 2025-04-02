'use client'

import React, { useEffect, useState } from 'react';
import NotificationDropdown from './NotificationDropdown';
import PocketBase from 'pocketbase'

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)

const Header: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setCurrentUser(pb.authStore.model);
  }, []);

  return (
    <header className="flex items-center justify-between py-4 px-8 ml-12 lg:ml-64">
      <h1 className="text-lg text-gray-800">
        {currentUser ? `Bienvenido ${currentUser.name}` : 'Cargando...'}
      </h1>
      <NotificationDropdown />
    </header>
  );
};

export default Header;
