import React from 'react';
import { FlaskConical, Upload, RotateCcw, ClipboardList, LogOut, User } from 'lucide-react';
import { SummaryStats } from '../types';

interface HeaderProps {
  stats: SummaryStats;
  userEmail?: string | null;
  onOpenImport: () => void;
  onOpenOrderList: () => void;
  onResetSample: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ stats, userEmail, onOpenImport, onOpenOrderList, onResetSample, onLogout }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900">시약·시료 재고 관리대장</h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full">v1.0</span>
            </div>
            <p className="text-xs text-slate-500">기준일: 2026-08-27 | 총 {stats.totalCount}건 등록됨</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {userEmail && (
            <div className="hidden sm:flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium mr-1">
              <User className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              <span className="truncate max-w-[180px]">{userEmail}</span>
            </div>
          )}

          <button
            onClick={onOpenImport}
            className="inline-flex items-center px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-xs"
            title="CSV, XLSX 파일 업로드 또는 텍스트 붙여넣기"
          >
            <Upload className="w-4 h-4 mr-1.5 text-slate-500" />
            대장 반입 / 업로드
          </button>
          
          <button
            onClick={onOpenOrderList}
            className="inline-flex items-center px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-xs"
            title="만료·임박·부족 항목 발주 후보 복사"
          >
            <ClipboardList className="w-4 h-4 mr-1.5" />
            발주 후보 복사
          </button>

          <button
            onClick={onResetSample}
            className="inline-flex items-center px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
            title="기본 80행 샘플 데이터로 복원"
          >
            <RotateCcw className="w-4 h-4 mr-1 text-slate-500" />
            초기화
          </button>

          <button
            onClick={onLogout}
            className="inline-flex items-center px-3 py-2 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition"
            title="로그아웃"
          >
            <LogOut className="w-4 h-4 mr-1 text-rose-500" />
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
};

