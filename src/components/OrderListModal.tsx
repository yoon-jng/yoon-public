import React, { useState } from 'react';
import { X, Clipboard, Check, FileText } from 'lucide-react';
import { ReagentItem } from '../types';
import { generateOrderCandidatesText } from '../utils/reagentUtils';

interface OrderListModalProps {
  items: ReagentItem[];
  onClose: () => void;
}

export const OrderListModal: React.FC<OrderListModalProps> = ({ items, onClose }) => {
  const [copied, setCopied] = useState(false);
  const orderText = generateOrderCandidatesText(items);
  const targetCount = items.filter(i => i.expiryState === '만료' || i.expiryState === '임박' || i.qtyState === '부족').length;

  const handleCopy = () => {
    navigator.clipboard.writeText(orderText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">발주 후보 목록 (만료·임박·부족)</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <p className="text-slate-600">
            유효기간 만료·임박 또는 잔량이 부족한 총 <span className="font-bold text-indigo-600">{targetCount}건</span>의 시약 항목입니다. 엑셀이나 이메일에 바로 붙여넣을 수 있도록 탭(Tab) 구분 텍스트로 구성되었습니다.
          </p>

          <div className="relative">
            <textarea
              readOnly
              rows={10}
              value={orderText}
              className="w-full p-3 font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none select-all"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-slate-400 text-[11px]">클립보드 복사 버튼을 눌러 스프레드시트에 붙여넣으세요.</span>
            <div className="flex space-x-3">
              <button
                onClick={handleCopy}
                className={`inline-flex items-center px-4 py-2 font-medium text-white rounded-lg transition shadow-xs ${
                  copied ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1.5" />
                    클립보드 복사 완료!
                  </>
                ) : (
                  <>
                    <Clipboard className="w-4 h-4 mr-1.5" />
                    탭 텍스트 클립보드 복사
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
