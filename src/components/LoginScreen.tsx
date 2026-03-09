import { Lock, User } from 'lucide-react';
import { useState, FormEvent } from 'react';

interface LoginScreenProps {
  onLogin: (username: string) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === '1234') {
      onLogin(username);
    } else {
      setError('Invalid credentials. Use admin/1234');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F3EF] p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#B91C1C] opacity-5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[10%] w-[400px] h-[400px] bg-[#1A1D24] opacity-5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 relative z-10">
        <div className="bg-[#1A1D24] p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#B91C1C] to-transparent"></div>
          <div className="w-16 h-16 bg-[#B91C1C] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform rotate-3">
            <Lock size={32} className="text-white transform -rotate-3" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wider uppercase">Employee Login</h2>
          <p className="text-gray-400 text-sm mt-2 font-mono flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            System Online
          </p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Employee ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B91C1C]/20 focus:border-[#B91C1C] outline-none transition-all font-mono tracking-wide text-gray-800"
                  placeholder="admin"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B91C1C]/20 focus:border-[#B91C1C] outline-none transition-all font-mono tracking-wide text-gray-800"
                  placeholder="••••"
                  autoComplete="current-password"
                />
              </div>
              {error && <p className="text-[#B91C1C] text-xs mt-3 font-medium text-center">{error}</p>}
            </div>
            
            <button
              type="submit"
              className="w-full bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold py-3 px-4 rounded-xl transition-colors uppercase tracking-wider text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-2"
            >
              Sign In
            </button>
          </form>
          
          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-xs text-gray-400 font-mono">
              Noodle Master MES System<br/>
              Single Factory Mode
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
