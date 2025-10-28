'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MembersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
    if (!isLoading && user && user.role === 'member') {
      router.push('/dashboard'); // Only coaches/admins can access this page
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-primary">
        <div className="text-heading-secondary text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || user.role === 'member') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-primary container-responsive section-spacing">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-heading-primary text-3xl mb-6">
          Team Members
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Member Card 1 */}
          <div className="card-primary">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-accent-green bg-opacity-10 rounded-full flex items-center justify-center mr-3">
                <span className="workout-accent-progress text-xl">👤</span>
              </div>
              <div>
                <h3 className="text-body-primary font-medium">Alex Johnson</h3>
                <p className="text-body-small">Member since Jan 2024</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-body-small">Workouts completed:</span>
                <span className="text-body-primary font-medium">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-small">Current streak:</span>
                <span className="text-body-primary font-medium">7 days</span>
              </div>
            </div>
            <button className="btn-primary w-full">
              <span className="workout-accent-schedule mr-2">📊</span>
              View Progress
            </button>
          </div>

          {/* Member Card 2 */}
          <div className="card-primary">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-accent-purple bg-opacity-10 rounded-full flex items-center justify-center mr-3">
                <span className="workout-accent-achievement text-xl">👤</span>
              </div>
              <div>
                <h3 className="text-body-primary font-medium">Sarah Davis</h3>
                <p className="text-body-small">Member since Mar 2024</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-body-small">Workouts completed:</span>
                <span className="text-body-primary font-medium">18</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-small">Current streak:</span>
                <span className="text-body-primary font-medium">3 days</span>
              </div>
            </div>
            <button className="btn-primary w-full">
              <span className="workout-accent-schedule mr-2">📊</span>
              View Progress
            </button>
          </div>

          {/* Member Card 3 */}
          <div className="card-primary">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-accent-orange bg-opacity-10 rounded-full flex items-center justify-center mr-3">
                <span className="workout-accent-strength text-xl">👤</span>
              </div>
              <div>
                <h3 className="text-body-primary font-medium">Mike Wilson</h3>
                <p className="text-body-small">Member since Feb 2024</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-body-small">Workouts completed:</span>
                <span className="text-body-primary font-medium">31</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-small">Current streak:</span>
                <span className="text-body-primary font-medium">12 days</span>
              </div>
            </div>
            <button className="btn-primary w-full">
              <span className="workout-accent-schedule mr-2">📊</span>
              View Progress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}