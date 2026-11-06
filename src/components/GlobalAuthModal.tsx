'use client';

import React from 'react';
import { useAfterhours } from '@/context/AfterhoursContext';
import { AuthModal } from './AuthModal';

export function GlobalAuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalMode } = useAfterhours();

  return (
    <AuthModal
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      defaultMode={authModalMode}
    />
  );
}
