'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'حدث خطأ غير متوقع');
      }
    } catch {
      setError('تعذّر الاتصال بالخادم، حاول مجدداً');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)',
      fontFamily: "'Tajawal', sans-serif",
      direction: 'rtl',
    }}>
      {/* Glow effects */}
      <div style={{
        position: 'fixed', top: '-10%', right: '-10%', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-10%', left: '-10%', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(212,175,55,0.10) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: '20px',
        padding: '3rem 3.5rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '70px', height: '70px',
            background: 'linear-gradient(135deg, #d4af37, #f0d060)',
            borderRadius: '18px',
            boxShadow: '0 8px 32px rgba(212,175,55,0.4)',
            marginBottom: '1rem',
            fontSize: '2rem',
          }}>
            🔐
          </div>
          <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>
            DK7 <span style={{ color: '#d4af37' }}>Admin</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            لوحة تحكم المتجر
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'rgba(220,38,38,0.15)',
            border: '1px solid rgba(220,38,38,0.4)',
            borderRadius: '10px',
            color: '#fca5a5',
            padding: '0.8rem 1rem',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            textAlign: 'center',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '500' }}>
              اسم المستخدم
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                fontSize: '1.1rem', opacity: 0.5,
              }}>👤</span>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                autoComplete="username"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem 0.85rem 3rem',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '1rem',
                  fontFamily: "'Tajawal', sans-serif",
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box',
                  direction: 'ltr',
                  textAlign: 'right',
                }}
                onFocus={e => { e.target.style.borderColor = '#d4af37'; e.target.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '500' }}>
              كلمة المرور
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                fontSize: '1.1rem', opacity: 0.5,
              }}>🔒</span>
              <input
                type={showPass ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                required
                autoComplete="current-password"
                style={{
                  width: '100%',
                  padding: '0.85rem 3rem 0.85rem 3rem',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '1rem',
                  fontFamily: "'Tajawal', sans-serif",
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box',
                  direction: 'ltr',
                  textAlign: 'right',
                }}
                onFocus={e => { e.target.style.borderColor = '#d4af37'; e.target.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem',
                  opacity: 0.5, color: '#fff', padding: 0,
                }}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="login-submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              background: loading
                ? 'rgba(212,175,55,0.5)'
                : 'linear-gradient(135deg, #d4af37, #f0d060)',
              border: 'none',
              borderRadius: '10px',
              color: '#1a1a1a',
              fontSize: '1.1rem',
              fontWeight: '800',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Tajawal', sans-serif",
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 20px rgba(212,175,55,0.4)',
            }}
            onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 30px rgba(212,175,55,0.5)'; } }}
            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 20px rgba(212,175,55,0.4)'; }}
          >
            {loading ? '⏳ جاري التحقق...' : '🚀 دخول إلى لوحة التحكم'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: '2rem', marginBottom: 0 }}>
          DK7 Store Admin Panel &copy; 2026
        </p>
      </div>
    </div>
  );
}
