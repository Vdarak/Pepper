
import React, { useState, useEffect, useCallback } from 'react';
import { fetchUsers, loginUser } from '../services/authService';
import { LoadingSpinner, WrenchIcon } from './icons';

interface LoginPageProps {
  onLoginSuccess: (userId: string, userName:string) => void;
  config: { apiUrl: string };
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, config }) => {
  const [users, setUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [pin, setPin] = useState('');
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    if (!config.apiUrl) {
      setUsers([]);
      // Don't show an error initially, let the user configure first.
      return;
    }
    setIsUsersLoading(true);
    setError(null);
    try {
      const fetchedUsers = await fetchUsers(config.apiUrl);
      const sortedUsers = fetchedUsers.sort((a, b) => a.localeCompare(b));
      setUsers(sortedUsers);
      if (sortedUsers.length === 0) {
        setError("No users found. Please check your API configuration or backend.");
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to fetch users: ${errorMessage}`);
      setUsers([]);
    } finally {
      setIsUsersLoading(false);
    }
  }, [config.apiUrl]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || pin.length !== 4) {
      setError("Please select a user and enter a 4-digit PIN.");
      return;
    }
    setIsLoginLoading(true);
    setError(null);
    try {
      const result = await loginUser(config.apiUrl, selectedUser, pin);
      if (result.success && result.Id) {
        onLoginSuccess(result.Id, selectedUser);
      } else {
        setError("Login failed. Please check your PIN and try again.");
        setPin(''); // Clear pin on failure
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Login failed: ${errorMessage}`);
    } finally {
      setIsLoginLoading(false);
    }
  };
  
  const isLoading = isUsersLoading || isLoginLoading;

  return (
    <main className="container mx-auto max-w-sm p-4 flex flex-col items-center justify-center flex-grow">
      <div className="w-full bg-slate-750/60 backdrop-blur-xl rounded-2xl shadow-2xl shadow-white/25 p-8 border border-slate-700 mt-8">
        <h2 className="text-xl font-bold text-center text-silver-light mb-6">Welcome Back</h2>
        {!config.apiUrl ? (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 rounded-lg text-sm text-center flex items-center justify-center gap-2">
              <span>Click the</span>
              <WrenchIcon className="w-4 h-4" />
              <span>icon above to begin.</span>
            </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="user-select" className="block text-sm font-medium text-silver-light mb-1">Select User</label>
              <div className="relative">
                <select
                  id="user-select"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  disabled={isLoading || users.length === 0}
                  className={`w-full appearance-none bg-slate-800 border border-slate-700 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition disabled:opacity-50 disabled:cursor-not-allowed ${!selectedUser ? 'text-silver-medium' : 'text-silver-light'}`}
                >
                  {isUsersLoading ? (
                    <option>Loading users...</option>
                  ) : users.length > 0 ? (
                    <>
                      <option value="" disabled>Select a user...</option>
                      {users.map(user => <option key={user} value={user}>{user}</option>)}
                    </>
                  ) : (
                    <option>No users available</option>
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-silver-medium">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="pin-input" className="block text-sm font-medium text-silver-light mb-1">PIN</label>
              <input
                type="password"
                id="pin-input"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                maxLength={4}
                pattern="\d{4}"
                inputMode="numeric"
                placeholder="••••"
                required
                disabled={isLoading || users.length === 0}
                className="w-full tracking-[1em] text-center bg-slate-800 border border-slate-700 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition disabled:opacity-50"
              />
            </div>
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg text-sm">
                <p>{error}</p>
              </div>
            )}
            <div>
              <button
                type="submit"
                disabled={isLoading || !selectedUser || pin.length !== 4}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-b from-primary/60 to-primary-dark/60 hover:from-primary-dark hover:to-primary-dark disabled:bg-slate-700/50 disabled:from-slate-700/50 disabled:to-slate-700/50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all duration-200 shadow-lg shadow-primary/10 hover:shadow-primary/20 text-lg"
              >
                {isLoginLoading ? (
                  <>
                    <LoadingSpinner className="w-6 h-6" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
};

export default LoginPage;