'use client'

import React from 'react';
import NotificationDropdown from './NotificationDropdown';
import PocketBase from 'pocketbase'

const pb = new PocketBase('http://127.0.0.1:8090')

const currentUser = pb.authStore.model ? pb.authStore.model : 'Invitado';

const Header: React.FC = () => {
  console.log(pb.authStore);

  return (
    <header className="flex items-center justify-end py-4 px-8 md:ml-64">
      {/* <h1 className="text-lg font-bold text-gray-800">Bienvenido {currentUser.name}</h1> */}
      <NotificationDropdown />
    </header>
  );
};

export default Header;
