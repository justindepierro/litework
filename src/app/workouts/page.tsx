'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function WorkoutsPage() {
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-heading-primary text-3xl mb-6">
          Workout Management
        </h1>
        
        <div className="card-primary mb-8">
          <h2 className="text-heading-secondary text-xl mb-4">Create New Workout</h2>
          <p className="text-body-secondary mb-4">
            Design custom workout plans for your team members.
          </p>
          <button className="btn-primary">
            <span className="workout-accent-strength mr-2">💪</span>
            Create Workout
          </button>
        </div>

        <div className="card-primary">
          <h2 className="text-heading-secondary text-xl mb-4">Recent Workouts</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-silver-200 rounded-lg">
              <div>
                <h3 className="text-body-primary font-medium">Upper Body Strength</h3>
                <p className="text-body-small">Bench Press, Rows, Shoulder Press</p>
              </div>
              <div className="flex space-x-2">
                <button className="btn-secondary">Edit</button>
                <button className="btn-primary">Assign</button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-silver-200 rounded-lg">
              <div>
                <h3 className="text-body-primary font-medium">Lower Body Power</h3>
                <p className="text-body-small">Squats, Deadlifts, Leg Press</p>
              </div>
              <div className="flex space-x-2">
                <button className="btn-secondary">Edit</button>
                <button className="btn-primary">Assign</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}