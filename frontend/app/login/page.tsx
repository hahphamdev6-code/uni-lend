'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { loginUser } from '@/lib/apiClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await loginUser({ email, password });
      window.localStorage.setItem('uni_lend_token', res.data.token);
      window.localStorage.setItem('uni_lend_user', JSON.stringify(res.data));
      document.cookie = `uni_lend_token=${res.data.token}; path=/`;
      router.push('/profile');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Sai email hoặc mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h1 className="mb-6 text-xl font-semibold">Đăng nhập</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="email"
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            type="password"
            label="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" isLoading={isLoading}>
            Đăng nhập
          </Button>
        </form>
      </Card>
    </div>
  );
}
