import React, { useState } from 'react';
import { ReagentItem, DuplicateGroup } from '../types';
import { X, AlertTriangle, CheckCircle, Copy, Info, Save } from 'lucide-react';

interface ReagentDetailModalProps {
  item: ReagentItem;
  duplicateGroups: DuplicateGroup[];
  userNote?: string;
  onClose: () => void;
  onUpdateItem: (updated: ReagentItem) => void;
  onSaveUserNote: (reagentId: string, note: string) => void;
}

export const ReagentDetailModal: React.FC<ReagentDetailModalProps> = ({
  item,
  duplicateGroups,
  userNote = '',
  onClose,
  onUpdateItem,
  onSaveUserNote,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ReagentItem>({ ...item });
  const [noteContent, setNoteContent] = useState(userNote);
  const [savingNote, setSavingNote] = useState(false);
  const [noteSavedSuccess, setNoteSavedSuccess] = useState(false);

  const matchingGroup = duplicateGroups.find(g => g.casNo === item.cas_no);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateItem(formData);
    setIsEditing(false);
  };

  const handleSaveNoteClick = () => {
    setSavingNote(true);
    onSaveUserNote(item.reagent_id, noteContent);
    setTimeout(() => {
      setSavingNote(false);
      setNoteSavedSuccess(true);
      setTimeout(() => setNoteSavedSuccess(false), 2000);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              {item.reagent_id}
            </span>
            <h3 className="text-base font-bold text-slate-900">{item.reagent_name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6 text-xs">
          {!isEditing ? (
            <>
              {/* Warnings / Status Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`p-3.5 rounded-xl border ${
                  item.expiryState === '만료' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                  item.expiryState === '임박' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                  'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                  <div className="font-semibold text-xs mb-1">유효기간 판정</div>
                  <div className="text-sm font-bold">
                    {item.expiryState} (D {item.dDay !== null ? (item.dDay >= 0 ? `-${item.dDay}` : `+${Math.abs(item.dDay)}`) : '미기재'})
                  </div>
                  <div className="text-[11px] opacity-80 mt-1">만료일: {item.expiry_date || '미기재'}</div>
                </div>

                <div className={`p-3.5 rounded-xl border ${
                  item.qtyState === '데이터 오류' ? 'bg-red-50 border-red-200 text-red-800' :
                  item.qtyState === '부족' ? 'bg-orange-50 border-orange-200 text-orange-800' :
                  'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                  <div className="font-semibold text-xs mb-1">잔량 및 상태 판정</div>
                  <div className="text-sm font-bold">
                    {item.qtyState} {item.remainRate !== null ? `(${item.remainRate}%)` : ''}
                  </div>
                  <div className="text-[11px] opacity-80 mt-1">
                    잔량: {item.remain_qty !== null ? item.remain_qty : '공란'} / 초기량: {item.init_qty} {item.qty_unit}
                  </div>
                </div>
              </div>

              {/* Duplicate Candidate Info */}
              {item.isDuplicateCandidate && matchingGroup && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-purple-900 space-y-2">
                  <div className="flex items-center space-x-2 font-semibold">
                    <Copy className="w-4 h-4 text-purple-600" />
                    <span>중복 등록 후보 그룹 (CAS: {matchingGroup.casNo})</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    동일 CAS 번호에 대해 명칭 표기가 상이한 항목이 존재합니다. (총 {matchingGroup.totalRows}건, 합산 잔량: {matchingGroup.totalRemainQty}{matchingGroup.unit})
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {matchingGroup.names.map((n, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-white border border-purple-300 rounded font-mono text-[11px] text-purple-800">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* All Details Grid */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-slate-400 block mb-0.5">시약 ID</span>
                  <span className="font-mono font-semibold text-slate-800">{item.reagent_id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">CAS 번호</span>
                  <span className="font-mono font-semibold text-slate-800">{item.cas_no}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">위험물 등급</span>
                  <span className="font-semibold text-slate-800">{item.hazard_class}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">보관 온도</span>
                  <span className="font-semibold text-slate-800">{item.storage_temp}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">보관 위치</span>
                  <span className="font-semibold text-slate-800">{item.location}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">담당 연구원</span>
                  <span className="font-semibold text-slate-800">{item.emp_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">입고 일자</span>
                  <span className="font-semibold text-slate-800">{item.receipt_date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">유효기간</span>
                  <span className="font-semibold text-slate-800">{item.expiry_date || '미기재'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">단위</span>
                  <span className="font-semibold text-slate-800">{item.qty_unit}</span>
                </div>
              </div>

              {item.remark && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <span className="text-slate-400 block mb-1">비고 및 특이사항</span>
                  <p className="text-slate-800 font-medium">{item.remark}</p>
                </div>
              )}

              {/* Private Researcher Memo Section */}
              <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-indigo-900 font-bold">
                    <Save className="w-4 h-4 text-indigo-600" />
                    <span>나만의 비공개 연구원 메모 (Supabase 실시간 연동)</span>
                  </div>
                  {noteSavedSuccess && (
                    <span className="text-emerald-700 font-medium flex items-center">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> 저장됨
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600">
                  이 시약에 대해 본인만 볼 수 있는 실험 노트, 폐기 계획, 특이사항 등을 기록할 수 있습니다.
                </p>
                <textarea
                  rows={3}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="예: 2분할 후 3번 실험실 흄후드 보관 중. 잔량 확인 필요."
                  className="w-full p-3 bg-white border border-indigo-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveNoteClick}
                    disabled={savingNote}
                    className="px-3.5 py-1.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-xs disabled:opacity-50"
                  >
                    {savingNote ? '저장 중...' : '메모 안전 저장'}
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                >
                  정보 수정
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                >
                  닫기
                </button>
              </div>
            </>
          ) : (
            /* Edit Form */
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">시약명</label>
                  <input
                    type="text"
                    value={formData.reagent_name}
                    onChange={e => setFormData({ ...formData, reagent_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">CAS 번호</label>
                  <input
                    type="text"
                    value={formData.cas_no}
                    onChange={e => setFormData({ ...formData, cas_no: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">위험물 등급</label>
                  <select
                    value={formData.hazard_class}
                    onChange={e => setFormData({ ...formData, hazard_class: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="인화성">인화성</option>
                    <option value="독성">독성</option>
                    <option value="부식성">부식성</option>
                    <option value="산화성">산화성</option>
                    <option value="해당없음">해당없음</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">보관 온도</label>
                  <select
                    value={formData.storage_temp}
                    onChange={e => setFormData({ ...formData, storage_temp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="RT">RT</option>
                    <option value="4℃">4℃</option>
                    <option value="-20℃">-20℃</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">보관 위치</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">담당자</label>
                  <input
                    type="text"
                    value={formData.emp_name}
                    onChange={e => setFormData({ ...formData, emp_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">초기량 ({formData.qty_unit})</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.init_qty !== null ? formData.init_qty : ''}
                    onChange={e => setFormData({ ...formData, init_qty: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">잔량 ({formData.qty_unit})</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.remain_qty !== null ? formData.remain_qty : ''}
                    onChange={e => setFormData({ ...formData, remain_qty: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">입고일자</label>
                  <input
                    type="date"
                    value={formData.receipt_date}
                    onChange={e => setFormData({ ...formData, receipt_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">유효기간</label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">비고</label>
                <input
                  type="text"
                  value={formData.remark || ''}
                  onChange={e => setFormData({ ...formData, remark: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                >
                  <Save className="w-3.5 h-3.5 mr-1" />
                  저장
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                >
                  취소
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
