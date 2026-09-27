import React, { useState } from 'react';
import { api, type User } from '../api/client';
import { LogIn, UserPlus, Lock, Mail, User as UserIcon, AlertCircle, Cpu, KeyRound } from 'lucide-react';

interface AuthGateProps {
  onAuthSuccess: (user: User) => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({ onAuthSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@pmpilot.ai');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        const res = await api.register({ name, email, password });
        onAuthSuccess(res.user);
      } else {
        const res = await api.login({ email, password });
        onAuthSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (fillEmail: string, fillPass: string) => {
    setIsRegister(false);
    setEmail(fillEmail);
    setPassword(fillPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-zinc-100 selection:bg-white selection:text-black">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-zinc-900 border border-zinc-800 rounded-2xl mb-2">
            <Cpu className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase tracking-widest">
            PMPilot
          </h1>
          <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">
            Autonomous Multi-Agent SDLC Platform
          </p>
        </div>

        {/* Credentials Quick-Fill Card */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-zinc-300" />
              <span>Select Role To Sign In</span>
            </span>
            <span className="text-[10px] text-zinc-500">1-Click Fill</span>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-mono text-zinc-500 uppercase">Manager Accounts</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('manager@pmpilot.ai', 'admin123')}
                className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-500 rounded-lg text-left transition-all cursor-pointer"
              >
                <div className="text-xs font-bold text-white">Project Manager</div>
                <div className="text-[11px] font-mono text-zinc-400 truncate">manager@pmpilot.ai</div>
                <div className="text-[10px] text-zinc-500 font-mono">pwd: admin123</div>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('admin@pmpilot.ai', 'admin123')}
                className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-500 rounded-lg text-left transition-all cursor-pointer"
              >
                <div className="text-xs font-bold text-white">Administrator</div>
                <div className="text-[11px] font-mono text-zinc-400 truncate">admin@pmpilot.ai</div>
                <div className="text-[10px] text-zinc-500 font-mono">pwd: admin123</div>
              </button>
            </div>

            <div className="text-[10px] font-mono text-zinc-500 uppercase pt-1">Employee Domain Roles</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('uiux@pmpilot.ai', 'password123')}
                className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-500 rounded-lg text-left transition-all cursor-pointer"
              >
                <div className="text-xs font-bold text-white">UI/UX Designer</div>
                <div className="text-[11px] font-mono text-zinc-400 truncate">uiux@pmpilot.ai</div>
                <div className="text-[10px] text-zinc-500 font-mono">Agent: UIUXAgent</div>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('architect@pmpilot.ai', 'password123')}
                className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-500 rounded-lg text-left transition-all cursor-pointer"
              >
                <div className="text-xs font-bold text-white">Solutions Architect</div>
                <div className="text-[11px] font-mono text-zinc-400 truncate">architect@pmpilot.ai</div>
                <div className="text-[10px] text-zinc-500 font-mono">Agent: ArchitectureAgent</div>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('backend@pmpilot.ai', 'password123')}
                className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-500 rounded-lg text-left transition-all cursor-pointer"
              >
                <div className="text-xs font-bold text-white">Backend Engineer</div>
                <div className="text-[11px] font-mono text-zinc-400 truncate">backend@pmpilot.ai</div>
                <div className="text-[10px] text-zinc-500 font-mono">Agent: BackendAgent</div>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('qa@pmpilot.ai', 'password123')}
                className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-500 rounded-lg text-left transition-all cursor-pointer"
              >
                <div className="text-xs font-bold text-white">QA Lead</div>
                <div className="text-[11px] font-mono text-zinc-400 truncate">qa@pmpilot.ai</div>
                <div className="text-[10px] text-zinc-500 font-mono">Agent: QATestingAgent</div>
              </button>
            </div>
          </div>
        </div>

        {/* Login / Register Form Card */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="text-sm font-semibold text-white">
              {isRegister ? 'Create Workspace Account' : 'Sign In to Workspace'}
            </div>
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-xs font-mono text-zinc-400 hover:text-white underline underline-offset-4 transition-colors"
            >
              {isRegister ? 'Already have account? Sign in' : 'Need an account? Register'}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-zinc-900 border border-zinc-700 rounded-lg flex items-start gap-2.5 text-xs text-zinc-200">
              <AlertCircle className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-400">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-9 pr-3 py-2 bg-black border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-400">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pmpilot.ai"
                  className="w-full pl-9 pr-3 py-2 bg-black border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-400">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-black border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white hover:bg-zinc-200 text-black font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : isRegister ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Workspace</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
