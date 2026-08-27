import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { parseRawDataToItems } from '../utils/reagentUtils';
import { ReagentItem } from '../types';

interface ImportModalProps {
  onClose: () => void;
  onImportSuccess: (items: ReagentItem[]) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ onClose, onImportSuccess }) => {
  const [activeTab, setActiveTab] = useState<'file' | 'paste'>('file');
  const [pasteText, setPasteText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewInfo, setPreviewInfo] = useState<{ count: number; sampleName: string } | null>(null);
  const [parsedItems, setParsedItems] = useState<ReagentItem[] | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);

    const reader = new FileReader();
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.csv')) {
      reader.onload = (evt) => {
        try {
          const text = evt.target?.result as string;
          const items = parseRawDataToItems(text);
          if (items.length === 0) {
            setErrorMsg('유효한 레코드를 찾을 수 없습니다. CSV 형식을 확인해주세요.');
            return;
          }
          setParsedItems(items);
          setPreviewInfo({ count: items.length, sampleName: file.name });
        } catch (err) {
          setErrorMsg('CSV 파싱 중 오류가 발생했습니다.');
        }
      };
      reader.readAsText(file, 'UTF-8');
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const csvText = XLSX.utils.sheet_to_csv(worksheet);
          const items = parseRawDataToItems(csvText);
          if (items.length === 0) {
            setErrorMsg('엑셀 시트에서 유효한 레코드를 찾을 수 없습니다.');
            return;
          }
          setParsedItems(items);
          setPreviewInfo({ count: items.length, sampleName: file.name });
        } catch (err) {
          setErrorMsg('엑셀 파일 파싱 중 오류가 발생했습니다.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setErrorMsg('지원하지 않는 파일 형식입니다. CSV 또는 XLSX 파일을 업로드해주세요.');
    }
  };

  const handlePasteProcess = () => {
    setErrorMsg(null);
    if (!pasteText.trim()) {
      setErrorMsg('붙여넣을 텍스트가 없습니다.');
      return;
    }
    try {
      const items = parseRawDataToItems(pasteText);
      if (items.length === 0) {
        setErrorMsg('유효한 레코드를 찾을 수 없습니다. 헤더와 데이터 형식을 확인해주세요.');
        return;
      }
      setParsedItems(items);
      setPreviewInfo({ count: items.length, sampleName: '직접 붙여넣기 텍스트' });
    } catch (err) {
      setErrorMsg('텍스트 파싱 중 오류가 발생했습니다.');
    }
  };

  const handleConfirm = () => {
    if (parsedItems && parsedItems.length > 0) {
      onImportSuccess(parsedItems);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900">시약 재고대장 반입</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Tabs */}
          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              onClick={() => { setActiveTab('file'); setParsedItems(null); setPreviewInfo(null); }}
              className={`flex-1 py-2 text-center font-medium rounded-md transition ${activeTab === 'file' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              파일 업로드 (CSV / XLSX)
            </button>
            <button
              onClick={() => { setActiveTab('paste'); setParsedItems(null); setPreviewInfo(null); }}
              className={`flex-1 py-2 text-center font-medium rounded-md transition ${activeTab === 'paste' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              텍스트 붙여넣기
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!parsedItems ? (
            activeTab === 'file' ? (
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-indigo-500 transition bg-slate-50">
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="font-semibold text-slate-700 mb-1">CSV 또는 XLSX 파일을 여기에 드래그하거나 선택하세요</p>
                <p className="text-[11px] text-slate-400 mb-4">reagent_id, reagent_name, cas_no 등 필수 헤더 포함</p>
                <label className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition cursor-pointer">
                  <span>파일 선택</span>
                  <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-slate-600 font-medium">CSV 또는 탭 구분 텍스트 붙여넣기</label>
                <textarea
                  rows={8}
                  placeholder="reagent_id,reagent_name,cas_no,hazard_class..."
                  value={pasteText}
                  onChange={e => setPasteText(e.target.value)}
                  className="w-full p-3 font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handlePasteProcess}
                    className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
                  >
                    데이터 파싱 및 검증
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center space-x-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-sm">파싱 완료 성공!</div>
                  <p className="text-emerald-700 text-[11px]">
                    파일: <span className="font-semibold">{previewInfo?.sampleName}</span> | 총 <span className="font-semibold">{previewInfo?.count}건</span>의 레코드가 정상적으로 검증되었습니다.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={handleConfirm}
                  className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-xs"
                >
                  재고 대장 반영하기
                </button>
                <button
                  onClick={() => setParsedItems(null)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition"
                >
                  다시 선택
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
