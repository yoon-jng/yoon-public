import React, { useState } from 'react';
import { FlaskConical, Mail, Lock, AlertCircle, CheckCircle2, Settings } from 'lucide-react';
import { getSupabaseClient, getStoredSupabaseConfig, saveSupabaseConfig } from '../lib/supabase';

interface AuthModalProps {
  onLoginSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLoginSuccess }) => {
  const [config, setConfig] = useState(getStoredSupabaseConfig());
  const [showConfig, setShowConfig] = useState(!config.url || !config.anonKey);
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Config input state
  const [urlInput, setUrlInput] = useState(config.url);
  const [keyInput, setKeyInput] = useState(config.anonKey);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || !keyInput.trim()) {
      setErrorMsg('Supabase URL과 Anon Key를 모두 입력해주세요.');
      return;
    }
    saveSupabaseConfig(urlInput, keyInput);
    setConfig({ url: urlInput, anonKey: keyInput });
    setShowConfig(false);
    setErrorMsg(null);
    setSuccessMsg('Supabase 설정이 저장되었습니다.');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const client = getSupabaseClient();
    if (!client) {
      setErrorMsg('Supabase가 올바르게 설정되지 않았습니다. 설정을 확인해주세요.');
      setShowConfig(true);
      return;
    }

    if (!email.trim() || !password.trim()) {
      setErrorMsg('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await client.auth.signUp({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) throw error;
        if (data.session) {
          setSuccessMsg('회원가입 및 로그인이 완료되었습니다!');
          setTimeout(() => onLoginSuccess(), 1000);
        } else {
          setSuccessMsg('회원가입 확인 메일이 발송되었거나 즉시 로그인 되었습니다. 확인 후 로그인해주세요.');
          setIsSignUp(false);
        }
      } else {
        const { data, error } = await client.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) throw error;
        if (data.session) {
          setSuccessMsg('로그인 성공!');
          setTimeout(() => onLoginSuccess(), 500);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || '인증 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-6 text-white text-center relative">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="absolute top-4 right-4 p-2 text-indigo-200 hover:text-white rounded-lg hover:bg-indigo-500/50 transition"
            title="Supabase 설정"
          >
            <Settings className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 text-white shadow-inner">
            <FlaskConical className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold">시약·시료 재고 관리대장</h2>
          <p className="text-xs text-indigo-100 mt-1">Supabase 인증 기반 연구원 전용 시스템</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {showConfig ? (
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900">
                <div className="font-bold mb-1">Supabase 연결 설정 필요</div>
                <p className="text-[11px] text-amber-800">
                  Supabase 프로젝트 URL과 Anon(Public) Key를 입력하여 로그인 연동을 활성화하세요.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Supabase 프로젝트 URL</label>
                <input
                  type="text"
                  placeholder="https://xyzproject.supabase.co"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Supabase Anon Key</label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIs..."
                  value={keyInput}
                  onChange={e => setKeyInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]"
                  required
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-xs"
                >
                  설정 저장 및 연결
                </button>
                {config.url && config.anonKey && (
                  <button
                    type="button"
                    onClick={() => setShowConfig(false)}
                    className="px-4 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition"
                  >
                    취소
                  </button>
                )}
              </div>
            </form>
          ) : (
            <>
              {/* Tab selector */}
              <div className="flex rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className={`flex-1 py-2 text-center font-medium rounded-md transition ${!isSignUp ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  로그인
                </button>
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className={`flex-1 py-2 text-center font-medium rounded-md transition ${isSignUp ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  회원가입
                </button>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">이메일 주소</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="researcher@lab.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">비밀번호</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-xs disabled:opacity-50"
                >
                  {loading ? '처리 중...' : isSignUp ? 'Supabase 계정 가입하기' : '로그인'}
                </button>
              </form>

              <div className="text-center pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                Supabase Auth를 통한 안전한 세션 관리
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
