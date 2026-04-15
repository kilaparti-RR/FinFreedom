import React from 'react';
import { auth, signOut } from '@/src/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, Shield, LogOut, Calendar } from 'lucide-react';

export const UserProfileScreen: React.FC = () => {
  const user = auth.currentUser;

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="card-natural p-0 overflow-hidden">
        <div className="h-32 bg-natural-olive" />
        <div className="px-8 pb-8">
          <div className="relative -mt-12 mb-6">
            <div className="h-24 w-24 rounded-2xl bg-white p-1 shadow-xl">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="h-full w-full rounded-xl object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="h-full w-full rounded-xl bg-natural-bg flex items-center justify-center">
                  <User className="h-12 w-12 text-natural-muted" />
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-1 mb-8">
            <h2 className="text-3xl font-serif text-natural-heading">{user.displayName}</h2>
            <p className="text-natural-muted font-medium">{user.email}</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-natural-bg/50 border border-natural-line">
              <div className="bg-white p-2.5 rounded-xl shadow-sm border border-natural-line">
                <Mail className="h-5 w-5 text-natural-olive" />
              </div>
              <div>
                <p className="label-natural">Email Address</p>
                <p className="text-sm font-semibold text-natural-ink">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 rounded-2xl bg-natural-bg/50 border border-natural-line">
              <div className="bg-white p-2.5 rounded-xl shadow-sm border border-natural-line">
                <Shield className="h-5 w-5 text-natural-olive" />
              </div>
              <div>
                <p className="label-natural">Account Status</p>
                <p className="text-sm font-semibold text-natural-ink">Verified Account</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 rounded-2xl bg-natural-bg/50 border border-natural-line">
              <div className="bg-white p-2.5 rounded-xl shadow-sm border border-natural-line">
                <Calendar className="h-5 w-5 text-natural-olive" />
              </div>
              <div>
                <p className="label-natural">Member Since</p>
                <p className="text-sm font-semibold text-natural-ink">
                  {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-natural-line">
            <Button 
              variant="outline" 
              className="w-full gap-2 rounded-full h-12 border-natural-negative/30 text-natural-negative hover:bg-natural-negative/5 hover:text-natural-negative" 
              onClick={() => signOut(auth)}
            >
              <LogOut className="h-4 w-4" />
              Sign Out from FinFreedom
            </Button>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-widest text-natural-muted font-bold">
          FinFreedom v1.0.0 • Secure Financial Management
        </p>
      </div>
    </div>
  );
};
