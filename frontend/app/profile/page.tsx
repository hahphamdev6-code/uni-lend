'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import { getCurrentUser } from '@/lib/apiClient';

interface Profile {
  id: number;
  email: string;
  fullName: string;
  roles: string[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then((res) => setProfile(res.data))
      .catch(() => {
        setError('Không thể tải thông tin hồ sơ. Vui lòng đăng nhập lại.');
        router.push('/login');
      });
  }, [router]);

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h1 className="mb-6 text-xl font-semibold">Hồ sơ của tôi</h1>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {!profile && !error && <p className="text-sm text-slate-500">Đang tải...</p>}
        {profile && (
          <dl className="flex flex-col gap-3 text-sm">
            <div>
              <dt className="text-slate-500">Họ và tên</dt>
              <dd className="font-medium text-slate-900">{profile.fullName}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium text-slate-900">{profile.email}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Vai trò</dt>
              <dd className="font-medium text-slate-900">{profile.roles.join(', ')}</dd>
            </div>
          </dl>
        )}
      </Card>
    </div>
  );
}
