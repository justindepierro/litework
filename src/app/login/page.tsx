'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await login(email, password);
    
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Invalid email or password');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-primary container-responsive py-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h2 className="text-heading-primary text-2xl sm:text-3xl">
            Welcome Back
          </h2>
          <p className="mt-2 text-body-secondary text-sm">
            Sign in to track your workouts
          </p>
          <div className="status-info mt-3">
            <p className="text-xs font-medium">Demo Credentials:</p>
            <p className="text-body-primary text-xs">coach@example.com</p>
            <p className="text-body-primary text-xs">password</p>
          </div>
        </div>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="text-body-primary block text-sm font-medium mb-1">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-3 border border-color-border-primary rounded-lg text-color-text-primary placeholder-color-text-tertiary focus:outline-none focus:ring-2 focus:ring-color-border-focus focus:border-color-border-focus text-base bg-color-bg-surface"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="text-body-primary block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-3 border border-color-border-primary rounded-lg text-color-text-primary placeholder-color-text-tertiary focus:outline-none focus:ring-2 focus:ring-color-border-focus focus:border-color-border-focus text-base bg-color-bg-surface"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="status-error">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
        
        <div className="text-center">
          <Link href="/" className="text-sm text-accent-blue hover:text-accent-blue transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}