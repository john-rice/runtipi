'use client';

import { useAction } from 'next-safe-action/hooks';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { loginAction } from '@/actions/login/login-action';
import { verifyTotpAction } from '@/actions/verify-totp/verify-totp-action';
import { useRouter } from 'next/navigation';
import { LoginForm } from '../LoginForm';
import { TotpForm } from '../TotpForm';

export function LoginContainer() {
  const [totpSessionId, setTotpSessionId] = useState<string | null>(null);
  const router = useRouter();

  const loginMutation = useAction(loginAction, {
    onError: (e) => {
      if (e.serverError) toast.error(e.serverError);
    },
    onSuccess: (data) => {
      if (data.success && data.totpSessionId) {
        setTotpSessionId(data.totpSessionId);
      } else {
        router.push('/dashboard');
      }
    },
  });

  const verifyTotpMutation = useAction(verifyTotpAction, {
    onError: (e) => {
      if (e.serverError) toast.error(e.serverError);
    },
    onSuccess: () => {
      router.push('/dashboard');
    },
  });

  if (totpSessionId) {
    return (
      <TotpForm
        loading={verifyTotpMutation.status === 'executing' || verifyTotpMutation.status === 'hasSucceeded'}
        onSubmit={(totpCode) => verifyTotpMutation.execute({ totpCode, totpSessionId })}
      />
    );
  }

  return (
    <LoginForm
      loading={loginMutation.status === 'executing' || loginMutation.status === 'hasSucceeded'}
      onSubmit={({ email, password }) => loginMutation.execute({ username: email, password })}
    />
  );
}
