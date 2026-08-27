import React, { useState } from 'react';
import { X, Database, Copy, Check, Terminal } from 'lucide-react';

interface SupabaseGuideModalProps {
  onClose: () => void;
}

export const SupabaseGuideModal: React.FC<SupabaseGuideModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const sqlCode = `-- 1. 시약 비공개 메모 테이블 생성
create table public.reagent_notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) default auth.uid() not null,
  reagent_id text not null,
  note_content text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, reagent_id)
);

-- 2. Row Level Security (RLS) 활성화
alter table public.reagent_notes enable row level security;

-- 3. 본인 메모만 조회/삽입/수정/삭제 가능하도록 RLS 정책 설정
create policy "Users can view their own reagent notes"
  on public.reagent_notes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own reagent notes"
  on public.reagent_notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own reagent notes"
  on public.reagent_notes for update
  using (auth.uid() = user_id);

create policy "Users can delete their own reagent notes"
  on public.reagent_notes for delete
  using (auth.uid() = user_id);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Supabase SQL 설정 안내 (연구원 메모 기능)</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 text-indigo-900">
            <div className="font-bold mb-1">안내</div>
            <p className="text-indigo-800 text-[11px]">
              연구원별 비공개 시약 메모 기능을 사용하려면 Supabase 대시보드의 <b>SQL Editor</b>에서 아래 쿼리를 실행하여 테이블 및 RLS 보안 정책을 생성해주세요. 다른 연구원의 메모는 절대 조회할 수 없습니다.
            </p>
          </div>

          <div className="relative">
            <div className="absolute right-3 top-3">
              <button
                onClick={handleCopy}
                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-white transition shadow-xs ${
                  copied ? 'bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                {copied ? '복사됨' : 'SQL 복사'}
              </button>
            </div>
            <textarea
              readOnly
              rows={14}
              value={sqlCode}
              className="w-full p-3.5 font-mono text-[11px] bg-slate-950 text-slate-200 rounded-xl focus:outline-none select-all"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
