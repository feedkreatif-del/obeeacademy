import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  History,
  Image as ImageIcon,
  Link2,
  Loader2,
  MessageCircle,
  Search,
  Sparkles,
  Trash2,
  Upload,
  UserCheck,
  X,
} from 'lucide-react';
import {
  UnlockContactDoc,
  UnlockLeadStage,
  UnlockPaymentStatus,
  WorksheetAnalysisRecord,
  WorksheetRubricId,
} from '../types';
import {
  PreparedWorksheetUploadFile,
  WORKSHEET_RUBRIC_OPTIONS,
  analyzeWorksheetWithApi,
  buildCompactCrmNoteFromAnalysis,
  buildFileMetaList,
  exportWorksheetAnalysisPdf,
  formatBytesCompact,
  prepareUploadedWorksheetFiles,
  saveWorksheetAnalyses,
  subscribeWorksheetAnalyses,
} from '../utils/worksheetAnalysis';

interface WorksheetAnalyzerPanelProps {
  contacts: UnlockContactDoc[];
  onUpdateLeadCrm: (
    contactId: string,
    updates: {
      leadStage?: UnlockLeadStage;
      mentorNotes?: string;
      paymentStatus?: UnlockPaymentStatus;
      paidAt?: number;
    }
  ) => Promise<void>;
}

function normalizeWaDigits(raw: string): string {
  const digits = (raw || '').replace(/[^\d]/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  if (digits.startsWith('8')) return `62${digits}`;
  return digits;
}

export const WorksheetAnalyzerPanel: React.FC<WorksheetAnalyzerPanelProps> = ({
  contacts,
  onUpdateLeadCrm,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFiles, setSelectedFiles] = useState<PreparedWorksheetUploadFile[]>([]);
  const [rubricId, setRubricId] = useState<WorksheetRubricId>('value_to_closing');
  const [customInstruction, setCustomInstruction] = useState('');
  const [linkedContactId, setLinkedContactId] = useState('');

  const [isDragging, setIsDragging] = useState(false);
  const [isPreparingFiles, setIsPreparingFiles] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [history, setHistory] = useState<WorksheetAnalysisRecord[]>([]);
  const [activeRecordId, setActiveRecordId] = useState<string>('');
  const [historySearch, setHistorySearch] = useState('');

  const [editableWaDraft, setEditableWaDraft] = useState('');
  const [copiedWaId, setCopiedWaId] = useState('');
  const [isSavingToCrm, setIsSavingToCrm] = useState(false);

  useEffect(() => {
    const unsub = subscribeWorksheetAnalyses((records) => {
      setHistory(records);
      setActiveRecordId((prev) => {
        if (prev && records.some((r) => r.id === prev)) return prev;
        return records[0]?.id || '';
      });
    });
    return () => unsub();
  }, []);

  const activeRecord = useMemo(
    () => history.find((r) => r.id === activeRecordId) || history[0] || null,
    [history, activeRecordId]
  );

  useEffect(() => {
    if (activeRecord) {
      setEditableWaDraft(activeRecord.analysis.whatsappFeedbackDraft || '');
    } else {
      setEditableWaDraft('');
    }
  }, [activeRecord?.id, activeRecord?.analysis.whatsappFeedbackDraft]);

  const activeRubric = useMemo(
    () =>
      WORKSHEET_RUBRIC_OPTIONS.find((item) => item.id === rubricId) ||
      WORKSHEET_RUBRIC_OPTIONS[0],
    [rubricId]
  );

  const filteredHistory = useMemo(() => {
    const q = historySearch.trim().toLowerCase();
    if (!q) return history;
    return history.filter((item) => {
      const target = `${item.analysis.brandName} ${item.analysis.participantName} ${item.analysis.subsector} ${item.rubricTitle}`.toLowerCase();
      return target.includes(q);
    });
  }, [history, historySearch]);

  const linkedContactForActive = useMemo(() => {
    const cid = activeRecord?.linkedContactId || linkedContactId;
    if (!cid) return null;
    return contacts.find((c) => c.id === cid) || null;
  }, [activeRecord?.linkedContactId, linkedContactId, contacts]);

  const handleFilesSelected = async (incomingList: FileList | File[] | null) => {
    if (!incomingList || incomingList.length === 0) return;
    setErrorMessage('');
    setSuccessMessage('');
    setIsPreparingFiles(true);
    try {
      const filesArr = Array.from(incomingList);
      const prepared = await prepareUploadedWorksheetFiles(filesArr);
      setSelectedFiles(prepared);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Gagal memproses file unggahan.'
      );
    } finally {
      setIsPreparingFiles(false);
    }
  };

  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleRunAnalysis = async () => {
    if (selectedFiles.length === 0) {
      setErrorMessage('Pilih minimal 1 file PDF atau foto lembar tugas terlebih dahulu.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsAnalyzing(true);
    try {
      const result = await analyzeWorksheetWithApi({
        files: selectedFiles,
        rubricId,
        customInstruction: customInstruction.trim(),
      });

      const matchedContact = linkedContactId
        ? contacts.find((c) => c.id === linkedContactId)
        : undefined;

      const newRecord: WorksheetAnalysisRecord = {
        id: `wa_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
        rubricId: result.rubricId,
        rubricTitle: result.rubricTitle,
        customInstruction: customInstruction.trim() || undefined,
        linkedContactId: matchedContact?.id,
        linkedContactLabel: matchedContact
          ? `${matchedContact.businessName} (${matchedContact.displayName})`
          : undefined,
        files: buildFileMetaList(selectedFiles),
        analysis: result.analysis,
        createdAt: Date.now(),
      };

      const nextHistory = [newRecord, ...history].slice(0, 25);
      setHistory(nextHistory);
      setActiveRecordId(newRecord.id);
      setEditableWaDraft(result.analysis.whatsappFeedbackDraft);
      await saveWorksheetAnalyses(nextHistory);

      setSelectedFiles([]);
      setSuccessMessage(
        `Analisa tugas "${result.analysis.brandName}" selesai (Skor Kelengkapan ${result.analysis.completenessScore}/100) dan tersimpan di riwayat.`
      );
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan saat menganalisa berkas tugas.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyWaDraft = async () => {
    if (!editableWaDraft.trim() || !activeRecord) return;
    try {
      await navigator.clipboard.writeText(editableWaDraft);
      setCopiedWaId(activeRecord.id);
      setTimeout(() => setCopiedWaId(''), 2200);
    } catch {
      setErrorMessage('Browser memblokir salin otomatis. Silakan blok teks feedback dan tekan Ctrl+C.');
    }
  };

  const handleSaveNoteToCrm = async () => {
    if (!activeRecord) return;
    const targetContactId = linkedContactId || activeRecord.linkedContactId;
    if (!targetContactId) {
      setErrorMessage(
        'Pilih peserta UMKM pada dropdown "Tautkan ke Database UMKM" terlebih dahulu agar catatan bisa disimpan ke CRM.'
      );
      return;
    }

    const contact = contacts.find((c) => c.id === targetContactId);
    if (!contact) {
      setErrorMessage('Data peserta di Bank Database UMKM tidak ditemukan.');
      return;
    }

    setIsSavingToCrm(true);
    setErrorMessage('');
    try {
      const compactSummary = buildCompactCrmNoteFromAnalysis(activeRecord);
      await onUpdateLeadCrm(contact.id, {
        mentorNotes: compactSummary,
      });

      const updatedHistory = history.map((item) =>
        item.id === activeRecord.id
          ? {
              ...item,
              linkedContactId: contact.id,
              linkedContactLabel: `${contact.businessName} (${contact.displayName})`,
            }
          : item
      );
      setHistory(updatedHistory);
      await saveWorksheetAnalyses(updatedHistory);
      setSuccessMessage(
        `Ringkasan hasil bedah tugas berhasil disimpan ke Catatan Mentor untuk ${contact.businessName}.`
      );
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Gagal menyimpan catatan ke CRM.'
      );
    } finally {
      setIsSavingToCrm(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    const nextHistory = history.filter((item) => item.id !== recordId);
    setHistory(nextHistory);
    if (activeRecordId === recordId) {
      setActiveRecordId(nextHistory[0]?.id || '');
    }
    await saveWorksheetAnalyses(nextHistory);
  };

  const totalSelectedBytes = selectedFiles.reduce((acc, f) => acc + f.sizeBytes, 0);

  return (
    <div className="space-y-6">
      {/* Banner Header */}
      <div className="bg-linear-to-r from-[#1F3A5F] to-[#274c7d] rounded-2xl p-5 sm:p-6 text-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 text-[#F28C28] text-[11px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Asisten Mentor obeeAcademy</span>
            </div>
            <h2 className="font-display text-lg sm:text-xl font-extrabold">
              Bedah Tugas & Lembar Kerja Peserta (AI)
            </h2>
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
              Unggah hasil scan PDF atau foto tulisan tangan lembar kerja peserta UMKM. Sistem otomatis membaca isi tulisan, mengecek bagian yang masih kosong, memberi skor kelengkapan, merumuskan perbaikan <em>Sebelum → Sesudah</em>, dan menyiapkan draft feedback WhatsApp siap kirim.
            </p>
          </div>
          <div className="bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs space-y-0.5 shrink-0">
            <div className="font-bold text-white/95">Format Didukung</div>
            <div className="text-white/75">PDF (&le; 3 MB) &bull; JPG / PNG / WebP</div>
            <div className="text-white/75">Maks. 6 file per sesi analisa</div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-900 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage('')}
            className="text-rose-600 hover:text-rose-900 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-900 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            className="text-emerald-700 hover:text-emerald-950 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Upload & Configuration + History */}
        <div className="xl:col-span-5 space-y-5">
          {/* Upload Card */}
          <div className="bg-white rounded-2xl border border-[#1F3A5F]/12 p-5 space-y-4">
            <h3 className="font-display text-base font-extrabold text-[#1F3A5F]">
              1. Unggah Berkas Tugas Peserta
            </h3>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp,.pdf,.jpg,.jpeg,.png,.webp"
              multiple
              className="hidden"
              onChange={(e) => {
                void handleFilesSelected(e.target.files);
                e.target.value = '';
              }}
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                void handleFilesSelected(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-[#F28C28] bg-amber-50/70'
                  : 'border-slate-300 hover:border-[#1F3A5F] bg-slate-50/60 hover:bg-slate-50'
              }`}
            >
              <div className="w-11 h-11 rounded-xl bg-[#1F3A5F]/10 text-[#1F3A5F] flex items-center justify-center mx-auto mb-2.5">
                {isPreparingFiles ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#F28C28]" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#1F3A5F]">
                {isPreparingFiles
                  ? 'Mengoptimalkan ukuran gambar/PDF...'
                  : 'Klik atau seret PDF / Foto Lembar Kerja ke sini'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Tulisan tangan, coretan lembar kerja, desain kemasan, maupun pembukuan UMKM
              </div>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                  <span>{selectedFiles.length} file siap dianalisa</span>
                  <span className="tabular-nums">
                    Total {formatBytesCompact(totalSelectedBytes)}
                  </span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedFiles.map((file, idx) => (
                    <div
                      key={`${file.name}-${idx}`}
                      className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {file.previewDataUrl ? (
                          <img
                            src={file.previewDataUrl}
                            alt={file.name}
                            className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-[#1F3A5F] truncate">
                            {file.name}
                          </div>
                          <div className="text-[10px] text-slate-500 tabular-nums">
                            {formatBytesCompact(file.sizeBytes)}
                            {file.originalSizeBytes > file.sizeBytes + 20_000
                              ? ` (dikompres dari ${formatBytesCompact(file.originalSizeBytes)})`
                              : ''}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSelectedFile(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer shrink-0"
                        title="Hapus lampiran"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rubric Selection */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-[#1F3A5F]">
                2. Pilih Rubrik Kurikulum Evaluasi
              </label>
              <select
                value={rubricId}
                onChange={(e) => setRubricId(e.target.value as WorksheetRubricId)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-300 rounded-xl text-[#1F3A5F]"
              >
                {WORKSHEET_RUBRIC_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.title}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-600 leading-relaxed bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5">
                {activeRubric.description}
              </p>
            </div>

            {/* Optional Linked CRM Contact */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#1F3A5F]">
                3. Tautkan ke Peserta di Bank Database UMKM (Opsional)
              </label>
              <select
                value={linkedContactId}
                onChange={(e) => setLinkedContactId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl text-slate-700"
              >
                <option value="">-- Tidak ditautkan dulu (bisa ditautkan nanti) --</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.businessName} — {c.displayName} ({c.whatsapp})
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Custom Focus */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#1F3A5F]">
                4. Catatan Fokus Tambahan Mentor (Opsional)
              </label>
              <textarea
                rows={2}
                maxLength={600}
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                placeholder={activeRubric.defaultHint}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <button
              type="button"
              disabled={isAnalyzing || isPreparingFiles || selectedFiles.length === 0}
              onClick={handleRunAnalysis}
              className="w-full py-3 px-4 rounded-xl bg-[#F28C28] hover:bg-[#d97719] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI Sedang Membaca & Membedah Tugas...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analisa Tugas Sekarang</span>
                </>
              )}
            </button>
          </div>

          {/* Saved History Card */}
          <div className="bg-white rounded-2xl border border-[#1F3A5F]/12 p-5 space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#F28C28]" />
                <h3 className="font-display text-sm sm:text-base font-extrabold text-[#1F3A5F]">
                  Riwayat Bedah Tugas ({history.length})
                </h3>
              </div>
            </div>

            {history.length > 0 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Cari nama brand / peserta..."
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            )}

            {filteredHistory.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                {history.length === 0
                  ? 'Belum ada riwayat analisa tugas. Unggah berkas di atas untuk memulai.'
                  : 'Tidak ada riwayat yang cocok dengan pencarian.'}
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {filteredHistory.map((item) => {
                  const isActive = item.id === activeRecord?.id;
                  const score = item.analysis.completenessScore;
                  const scoreClass =
                    score >= 75
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : score >= 50
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-rose-100 text-rose-800 border-rose-200';

                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveRecordId(item.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-colors flex items-start justify-between gap-2 ${
                        isActive
                          ? 'bg-[#1F3A5F]/5 border-[#1F3A5F] shadow-2xs'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-extrabold text-[#1F3A5F] truncate">
                            {item.analysis.brandName}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border tabular-nums ${scoreClass}`}
                          >
                            {score}/100
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 truncate">
                          {item.analysis.participantName} &bull; {item.rubricTitle}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(item.createdAt).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleDeleteRecord(item.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 shrink-0 cursor-pointer"
                        title="Hapus riwayat analisa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Analysis Output Report */}
        <div className="xl:col-span-7">
          {!activeRecord ? (
            <div className="bg-white rounded-2xl border border-[#1F3A5F]/12 p-8 sm:p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF7EC] border border-[#F28C28]/25 flex items-center justify-center mx-auto text-[#F28C28]">
                <ImageIcon className="w-7 h-7" />
              </div>
              <h3 className="font-display text-base sm:text-lg font-extrabold text-[#1F3A5F]">
                Hasil Bedah Tugas Akan Tampil di Sini
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Unggah file PDF atau foto tulisan tangan peserta di panel kiri, pilih rubrik kurikulum obeeAcademy, lalu klik <strong>Analisa Tugas Sekarang</strong>.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#1F3A5F]/12 p-5 sm:p-6 space-y-6">
              {/* Top Report Summary */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#1F3A5F]/10 text-[#1F3A5F] text-[11px] font-bold">
                      {activeRecord.rubricTitle}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold">
                      {activeRecord.analysis.subsector}
                    </span>
                  </div>
                  <h3 className="font-display text-lg sm:text-xl font-extrabold text-[#1F3A5F]">
                    {activeRecord.analysis.brandName}
                  </h3>
                  <div className="text-xs text-slate-600 font-medium">
                    Peserta: <strong className="text-slate-900">{activeRecord.analysis.participantName}</strong>
                    {activeRecord.linkedContactLabel && (
                      <span className="ml-2 inline-flex items-center gap-1 text-emerald-700 font-bold">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Tertaut CRM: {activeRecord.linkedContactLabel}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Score Meter */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 min-w-[155px] text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Skor Kelengkapan
                  </div>
                  <div
                    className={`font-display text-2xl font-extrabold tabular-nums mt-0.5 ${
                      activeRecord.analysis.completenessScore >= 75
                        ? 'text-emerald-600'
                        : activeRecord.analysis.completenessScore >= 50
                        ? 'text-[#d97719]'
                        : 'text-rose-600'
                    }`}
                  >
                    {activeRecord.analysis.completenessScore}/100
                  </div>
                  <div className="text-[11px] font-bold text-[#1F3A5F] mt-0.5">
                    {activeRecord.analysis.rubricVerdict}
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyWaDraft}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedWaId === activeRecord.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Feedback WA Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Feedback WA</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isSavingToCrm}
                  onClick={handleSaveNoteToCrm}
                  className="px-3.5 py-2 rounded-xl bg-[#1F3A5F] hover:bg-[#162a45] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Link2 className="w-3.5 h-3.5 text-[#F28C28]" />
                  <span>
                    {isSavingToCrm ? 'Menyimpan ke CRM...' : 'Simpan ke Catatan CRM'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => exportWorksheetAnalysisPdf(activeRecord)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1F3A5F] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Rapor PDF</span>
                </button>
              </div>

              {/* Document Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1.5">
                <div className="text-xs font-extrabold uppercase tracking-wider text-[#1F3A5F]">
                  Ringkasan Pembacaan Berkas
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {activeRecord.analysis.documentSummary}
                </p>
                {activeRecord.files.length > 0 && (
                  <div className="text-[11px] text-slate-500 pt-1">
                    Sumber lampiran: {activeRecord.files.map((f) => f.fileName).join(', ')}
                  </div>
                )}
              </div>

              {/* Missing Sections Alert */}
              {activeRecord.analysis.missingSections.length > 0 && (
                <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Bagian Lembar Kerja yang Kosong / Terlewat</span>
                  </div>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-rose-950 list-disc pl-5">
                    {activeRecord.analysis.missingSections.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Strengths & Gaps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-2">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                    Poin Kuat Peserta
                  </div>
                  <ul className="space-y-1.5 text-xs text-emerald-950">
                    {activeRecord.analysis.strengths.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                    Celah & Koreksi Strategis
                  </div>
                  <ul className="space-y-1.5 text-xs text-amber-950">
                    {activeRecord.analysis.gapsAndCorrections.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <ArrowRight className="w-3.5 h-3.5 text-[#F28C28] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actionable Before -> After Recommendations */}
              {activeRecord.analysis.actionableRecommendations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-display text-sm sm:text-base font-extrabold text-[#1F3A5F]">
                    Rekomendasi Perbaikan Konkret (Sebelum &rarr; Sesudah)
                  </h4>
                  <div className="space-y-3">
                    {activeRecord.analysis.actionableRecommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-2.5"
                      >
                        <div className="text-xs font-extrabold text-[#1F3A5F]">
                          #{idx + 1} &bull; {rec.area}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                            <div className="text-[10px] font-extrabold uppercase text-slate-400">
                              Isi Saat Ini
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {rec.currentDraft}
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                            <div className="text-[10px] font-extrabold uppercase text-emerald-700">
                              Saran Rumusan Siap Pakai
                            </div>
                            <p className="text-xs font-semibold text-emerald-950 leading-relaxed whitespace-pre-line">
                              {rec.suggestedUpgrade}
                            </p>
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          <strong>Kenapa penting:</strong> {rec.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Coaching Questions */}
              {activeRecord.analysis.coachingQuestions.length > 0 && (
                <div className="bg-[#FFF7EC] border border-[#F28C28]/25 rounded-2xl p-4 space-y-2">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-[#1F3A5F]">
                    Pertanyaan Pemantik Saat Sesi Coaching 1-on-1
                  </div>
                  <ol className="space-y-1.5 text-xs sm:text-sm text-slate-800 list-decimal pl-5">
                    {activeRecord.analysis.coachingQuestions.map((q, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {q}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Editable WhatsApp Draft */}
              <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-4 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-900">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Draft Feedback WhatsApp (Bisa Diedit Sebelum Dikirim)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyWaDraft}
                      className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedWaId === activeRecord.id ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin Teks</span>
                        </>
                      )}
                    </button>
                    {linkedContactForActive && normalizeWaDigits(linkedContactForActive.whatsapp) && (
                      <a
                        href={`https://wa.me/${normalizeWaDigits(
                          linkedContactForActive.whatsapp
                        )}?text=${encodeURIComponent(editableWaDraft)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Kirim via WA</span>
                      </a>
                    )}
                  </div>
                </div>
                <textarea
                  rows={6}
                  value={editableWaDraft}
                  onChange={(e) => setEditableWaDraft(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-white border border-emerald-200 rounded-xl text-slate-800 leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
