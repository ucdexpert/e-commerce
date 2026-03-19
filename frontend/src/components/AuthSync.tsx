'use client';

import { useSyncAuth } from '@/hooks/useSyncAuth';

export default function AuthSync() {
  useSyncAuth();
  return null;
}
