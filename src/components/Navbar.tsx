import { Link } from 'react-router-dom';
import { Sparkles, History, LogOut, User, Crown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useFreemium } from '../hooks/useFreemium';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const { isPremium } = useFreemium();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#007AFF] to-[#BF5AF2]">
            LinkSumm
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-medium text-white uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-[#BF5AF2]" />
            AI
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {isPremium && (
                <Link to="/account" className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-xs font-medium text-amber-500">
                  <Crown className="w-3.5 h-3.5" />
                  PRO
                </Link>
              )}
              <Link to="/history" className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </Link>
              <div className="h-4 w-px bg-white/20"></div>
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                title="Sign Out"
              >
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-6 h-6 rounded-full" />
                ) : (
                  <User className="w-5 h-5" />
                )}
                <LogOut className="w-4 h-4 hidden sm:inline" />
              </button>
            </>
          ) : (
            <Link 
              to="/login"
              className="px-4 py-2 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/10 transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
