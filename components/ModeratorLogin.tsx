import React, { useState } from 'react';
import { Language, Moderator } from '../types';
import { TEXTS } from '../constants';
import * as api from '../api';
import { Logo } from './icons/Logo';

interface ModeratorLoginProps {
  language: Language;
  onLoginSuccess: (response: { moderator: Moderator; token: string }) => void;
}

const ModeratorLogin: React.FC<ModeratorLoginProps> = ({ language, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const texts = TEXTS.moderatorLogin;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await api.loginModerator(email, password);
      if (response) {
        onLoginSuccess(response);
      } else {
        setError(texts.invalidCredentials[language]);
      }
    } catch (err) {
      setError(texts.invalidCredentials[language]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center mb-8">
            <Logo className="h-12 w-auto text-primary mx-auto" />
            <h1 className="mt-4 text-2xl font-bold text-slate-800">{texts.title[language]}</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={texts.emailPlaceholder[language]}
            className="w-full p-3 bg-slate-100 border-2 border-slate-300 rounded-lg focus:ring-primary focus:border-primary transition"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={texts.passwordPlaceholder[language]}
            className="w-full p-3 bg-slate-100 border-2 border-slate-300 rounded-lg focus:ring-primary focus:border-primary transition"
            required
          />
          {error && <p className="text-sm text-danger text-center">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-slate-100 font-bold py-3 rounded-lg hover:bg-sky-700 transition-colors disabled:bg-slate-300"
          >
            {isLoading ? 'Logging in...' : texts.login[language]}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModeratorLogin;