import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    authModalMode,
    closeAuthModal,
    openAuthModal,
    signIn,
    signUp
  } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!authModalOpen) return null;

  const resetForm = () => {
    setFullName('');
    setPhone('');
    setEmail('');
    setPassword('');
    setError(null);
  };

  const handleModeChange = (mode: 'signin' | 'signup') => {
    resetForm();
    openAuthModal(mode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Email ve sifre gerekli.');
      return;
    }
    if (authModalMode === 'signup' && !fullName.trim()) {
      setError('Isim gerekli.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (authModalMode === 'signup') {
        await signUp(email.trim(), password, fullName.trim(), phone.trim() || undefined);
      } else {
        await signIn(email.trim(), password);
      }
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Islem basarisiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        onClick={() => {
          closeAuthModal();
          resetForm();
        }}
        aria-label="Close auth modal"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-[#101a22] p-5 text-white shadow-2xl">
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-[#16202a] p-1">
          <button
            type="button"
            onClick={() => handleModeChange('signin')}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold ${
              authModalMode === 'signin' ? 'bg-[#1183d4] text-white' : 'text-white/75'
            }`}
          >
            Giris Yap
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('signup')}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold ${
              authModalMode === 'signup' ? 'bg-[#1183d4] text-white' : 'text-white/75'
            }`}
          >
            Hesap Olustur
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {authModalMode === 'signup' && (
            <>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ad Soyad"
                className="w-full rounded-lg border border-white/15 bg-[#16202a] px-3 py-2 text-sm outline-none"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Telefon (opsiyonel)"
                className="w-full rounded-lg border border-white/15 bg-[#16202a] px-3 py-2 text-sm outline-none"
              />
            </>
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-lg border border-white/15 bg-[#16202a] px-3 py-2 text-sm outline-none"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sifre"
            className="w-full rounded-lg border border-white/15 bg-[#16202a] px-3 py-2 text-sm outline-none"
          />

          {error && (
            <p className="rounded-lg border border-red-300/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}
            </p>
          )}

          {authModalMode === 'signup' && (
            <p className="text-xs text-white/60">
              Hesap olusunca size otomatik benzersiz bir `ref code` atanir.
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-[#1183d4] px-4 py-2 text-sm font-bold disabled:opacity-60"
          >
            {isSubmitting
              ? 'Isleniyor...'
              : authModalMode === 'signup'
                ? 'Hesap Olustur'
                : 'Giris Yap'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
