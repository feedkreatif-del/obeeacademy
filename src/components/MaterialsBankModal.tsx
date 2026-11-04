import React, { useState } from 'react';
import {
  SavedMaterial,
  DEFAULT_PARTNERUP_CURRICULUM,
  PACKAGING_DESIGN_MARKETING_CURRICULUM,
  SESI_2_ACTION_PLAN_CURRICULUM,
  COPYWRITING_MATERIAL_PRESET,
  duplicateMaterial,
  createBlankMaterial,
  downloadMaterialAsJson,
  downloadAllMaterialsBundleAsJson,
} from '../utils/materialsManager';
import {
  Layers,
  BookOpen,
  Plus,
  Copy,
  Trash2,
  Check,
  Download,
  Upload,
  PlayCircle,
  X,
  Edit3,
  Calendar,
  Sparkles,
  HelpCircle,
  FileText,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface MaterialsBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: SavedMaterial[];
  activeMaterialId: string;
  onSelectActiveMaterial: (material: SavedMaterial) => Promise<void>;
  onEditMaterialInEditor: (material: SavedMaterial) => void;
  onSaveNewMaterial: (newMaterial: SavedMaterial, setAsActive?: boolean) => Promise<void>;
  onDeleteMaterial: (materialId: string) => Promise<void>;
}

export const MaterialsBankModal: React.FC<MaterialsBankModalProps> = ({
  isOpen,
  onClose,
  materials,
  activeMaterialId,
  onSelectActiveMaterial,
  onEditMaterialInEditor,
  onSaveNewMaterial,
  onDeleteMaterial,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  // Form State for Creating New Material
  const [newTitle, setNewTitle] = useState('');
  const [newOrganizer, setNewOrganizer] = useState('Program PartnerUp | Obeecreatives');
  const [newDescription, setNewDescription] = useState('');
  const [creationSource, setCreationSource] = useState<
    'duplicate_active' | 'template_packaging' | 'template_sesi_2' | 'template_sesi_1' | 'preset_copywriting' | 'blank'
  >('template_packaging');
  const [autoActivateNew, setAutoActivateNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentActiveMaterial =
    materials.find((m) => m.id === activeMaterialId) || materials[0] || DEFAULT_PARTNERUP_CURRICULUM;

  const handleActivate = async (material: SavedMaterial) => {
    setActivatingId(material.id);
    try {
      await onSelectActiveMaterial(material);
      setActionSuccessNotice(`Materi "${material.seminarTitle}" berhasil dijadikan materi aktif di semua layar!`);
      setTimeout(() => setActionSuccessNotice(null), 4000);
    } finally {
      setActivatingId(null);
    }
  };

  const handleDuplicate = async (source: SavedMaterial) => {
    const clone = duplicateMaterial(source);
    await onSaveNewMaterial(clone, false);
    setActionSuccessNotice(`Salinan "${clone.seminarTitle}" berhasil dibuat dan disimpan di Bank Materi!`);
    setTimeout(() => setActionSuccessNotice(null), 4000);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      let createdMaterial: SavedMaterial;

      if (creationSource === 'template_packaging') {
        const base = duplicateMaterial(PACKAGING_DESIGN_MARKETING_CURRICULUM, '');
        createdMaterial = {
          ...base,
          seminarTitle: newTitle.trim(),
          organizerName: newOrganizer.trim() || 'Program PartnerUp | Obeecreatives',
          description: newDescription.trim() || PACKAGING_DESIGN_MARKETING_CURRICULUM.description,
          content: {
            ...base.content,
            seminarTitle: newTitle.trim(),
            organizerName: newOrganizer.trim() || 'Program PartnerUp | Obeecreatives',
          },
        };
      } else if (creationSource === 'duplicate_active') {
        const base = duplicateMaterial(currentActiveMaterial, '');
        createdMaterial = {
          ...base,
          seminarTitle: newTitle.trim(),
          organizerName: newOrganizer.trim() || currentActiveMaterial.organizerName,
          description: newDescription.trim() || `Dibuat dari salinan "${currentActiveMaterial.seminarTitle}"`,
          content: {
            ...base.content,
            seminarTitle: newTitle.trim(),
            organizerName: newOrganizer.trim() || currentActiveMaterial.organizerName,
          },
        };
      } else if (creationSource === 'template_sesi_2') {
        const base = duplicateMaterial(SESI_2_ACTION_PLAN_CURRICULUM, '');
        createdMaterial = {
          ...base,
          seminarTitle: newTitle.trim(),
          organizerName: newOrganizer.trim() || 'Program PartnerUp | Obeecreatives',
          description: newDescription.trim() || SESI_2_ACTION_PLAN_CURRICULUM.description,
          content: {
            ...base.content,
            seminarTitle: newTitle.trim(),
            organizerName: newOrganizer.trim() || 'Program PartnerUp | Obeecreatives',
          },
        };
      } else if (creationSource === 'template_sesi_1') {
        const base = duplicateMaterial(DEFAULT_PARTNERUP_CURRICULUM, '');
        createdMaterial = {
          ...base,
          seminarTitle: newTitle.trim(),
          organizerName: newOrganizer.trim() || 'Program PartnerUp | Obeecreatives',
          description: newDescription.trim() || DEFAULT_PARTNERUP_CURRICULUM.description,
          content: {
            ...base.content,
            seminarTitle: newTitle.trim(),
            organizerName: newOrganizer.trim() || 'Program PartnerUp | Obeecreatives',
          },
        };
      } else if (creationSource === 'preset_copywriting') {
        const base = duplicateMaterial(COPYWRITING_MATERIAL_PRESET, '');
        createdMaterial = {
          ...base,
          seminarTitle: newTitle.trim(),
          organizerName: newOrganizer.trim() || 'Program PartnerUp | Obeecreatives',
          description: newDescription.trim() || COPYWRITING_MATERIAL_PRESET.description,
          content: {
            ...base.content,
            seminarTitle: newTitle.trim(),
            organizerName: newOrganizer.trim() || 'Program PartnerUp | Obeecreatives',
          },
        };
      } else {
        // Blank
        createdMaterial = createBlankMaterial(
          newTitle.trim(),
          newOrganizer.trim() || 'Program PartnerUp | Obeecreatives'
        );
        if (newDescription.trim()) {
          createdMaterial.description = newDescription.trim();
        }
      }

      await onSaveNewMaterial(createdMaterial, autoActivateNew);
      setActiveTab('list');
      setNewTitle('');
      setNewDescription('');
      setActionSuccessNotice(
        `Materi baru "${createdMaterial.seminarTitle}" berhasil dibuat ${
          autoActivateNew ? 'dan langsung aktif di layar presentasi' : 'di Bank Materi'
        }!`
      );
      setTimeout(() => setActionSuccessNotice(null), 4500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(String(event.target?.result));
        
        // Cek apakah bundle atau single material
        if (parsed.bundleVersion && Array.isArray(parsed.materials)) {
          for (const mat of parsed.materials) {
            if (mat.seminarTitle && mat.content) {
              await onSaveNewMaterial(mat, false);
            }
          }
          setActionSuccessNotice(`Berhasil memulihkan ${parsed.materials.length} materi dari file bundle cadangan!`);
        } else if (parsed.content || (parsed.questions && parsed.slides)) {
          const content = parsed.content || parsed;
          const newId = `mat_${Date.now()}_import`;
          const imported: SavedMaterial = {
            id: newId,
            seminarTitle: parsed.seminarTitle || content.seminarTitle || 'Materi Impor',
            organizerName: parsed.organizerName || content.organizerName || 'Program PartnerUp',
            description: `Diimpor dari file ${file.name} pada ${new Date().toLocaleDateString('id-ID')}`,
            category: 'Materi Impor',
            isDefault: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            content: {
              seminarTitle: parsed.seminarTitle || content.seminarTitle || 'Materi Impor',
              organizerName: parsed.organizerName || content.organizerName || 'Program PartnerUp',
              questions: content.questions || [],
              polls: content.polls || [],
              slides: content.slides || [],
              qnaTopics: content.qnaTopics || ['Tanya Jawab'],
              brandTheme: content.brandTheme,
              updatedAt: Date.now(),
              materialId: newId,
            },
          };
          await onSaveNewMaterial(imported, false);
          setActionSuccessNotice(`Materi "${imported.seminarTitle}" berhasil diimpor ke Bank Materi!`);
        }
        setTimeout(() => setActionSuccessNotice(null), 4500);
      } catch (err) {
        console.error('File JSON gagal diproses:', err);
        alert('Format file JSON materi tidak sesuai. Pastikan file berasal dari fitur Ekspor JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1F3A5F]/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#1F3A5F]/20 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#1F3A5F] to-[#2A4D7C] text-white flex items-center justify-between gap-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#F28C28] shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-display font-extrabold text-lg sm:text-xl tracking-tight truncate">
                  Bank Materi & Kurikulum Seminar
                </h2>
                <span className="text-[11px] font-bold bg-[#F28C28] text-white px-2 py-0.5 rounded-full shrink-0">
                  {materials.length} Materi Tersimpan
                </span>
              </div>
              <p className="text-xs text-white/75 truncate mt-0.5">
                Kelola ragam materi pelatihan tanpa takut materi lama hilang. Bisa dimuat ulang, diedit, atau dibuat baru kapan saja.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Tutup Bank Materi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Notice Banner */}
        {actionSuccessNotice && (
          <div className="bg-emerald-50 border-b border-emerald-300 px-6 py-2.5 flex items-center gap-2.5 text-emerald-900 text-xs font-bold animate-in slide-in-from-top-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessNotice}</span>
          </div>
        )}

        {/* Tab Switcher & Quick Actions */}
        <div className="bg-[#FFF7EC] px-5 sm:px-6 py-3 border-b border-[#1F3A5F]/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#1F3A5F]/15 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-[#1F3A5F] text-white'
                  : 'text-[#1F3A5F]/80 hover:bg-[#FFF7EC]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Daftar Bank Materi ({materials.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('create');
                setNewTitle('');
                setCreationSource('duplicate_active');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-[#F28C28] text-white'
                  : 'text-[#F28C28] hover:bg-[#FFF7EC]'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Buat Materi Baru</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadAllMaterialsBundleAsJson(materials)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-[#1F3A5F]/15 text-[#1F3A5F] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Unduh seluruh materi dalam 1 file bundle JSON untuk cadangan lengkap"
            >
              <Download className="w-3.5 h-3.5 text-[#2A9D8F]" />
              <span className="hidden sm:inline">Cadangkan Semua (.JSON)</span>
              <span className="sm:hidden">Cadangkan</span>
            </button>

            <label className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-[#1F3A5F]/15 text-[#1F3A5F] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs">
              <Upload className="w-3.5 h-3.5 text-[#F28C28]" />
              <span className="hidden sm:inline">Impor File (.JSON)</span>
              <span className="sm:hidden">Impor</span>
              <input type="file" accept=".json" onChange={handleImportJsonFile} className="hidden" />
            </label>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {activeTab === 'list' ? (
            <div className="space-y-4">
              
              {/* Active Material Prominent Callout */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-2 border-emerald-500/50 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      Sedang Aktif di Layar Presentasi
                    </span>
                    {currentActiveMaterial.category && (
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                        {currentActiveMaterial.category}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-extrabold text-base sm:text-lg text-[#1F3A5F]">
                    {currentActiveMaterial.seminarTitle}
                  </h3>
                  <p className="text-xs text-[#1F3A5F]/75">
                    {currentActiveMaterial.description || 'Materi ini sedang tampil di layar Proyektor, Slide Deck, Remote HP, dan HP Peserta.'}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#1F3A5F]/65 pt-1">
                    <span>📚 {currentActiveMaterial.content.slides.length} Slide</span>
                    <span>•</span>
                    <span>📝 {currentActiveMaterial.content.questions.length} Pertanyaan</span>
                    <span>•</span>
                    <span>📊 {currentActiveMaterial.content.polls.length} Polling</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Diperbarui {new Date(currentActiveMaterial.updatedAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                  <button
                    type="button"
                    onClick={() => {
                      onEditMaterialInEditor(currentActiveMaterial);
                      onClose();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#1F3A5F] hover:bg-[#162a45] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    title="Buka materi ini di editor untuk mengubah slide atau pertanyaan"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#F28C28]" />
                    <span>Buka di Editor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicate(currentActiveMaterial)}
                    className="px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-[#1F3A5F]/20 text-[#1F3A5F] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    title="Buat salinan baru dari materi aktif ini untuk sesi berikutnya"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#F28C28]" />
                    <span>Duplikasi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadMaterialAsJson(currentActiveMaterial)}
                    className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-[#1F3A5F]/20 text-[#1F3A5F] transition-colors cursor-pointer shadow-2xs"
                    title="Unduh file JSON materi ini"
                  >
                    <Download className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>

              {/* Grid of All Saved Materials */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#1F3A5F]/70">
                    Koleksi Materi Tersimpan ({materials.length})
                  </h4>
                  <span className="text-xs text-[#1F3A5F]/60">
                    Klik <strong>"Jadikan Materi Aktif"</strong> untuk memuat ke proyektor
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {materials.map((mat) => {
                    const isActive = mat.id === activeMaterialId;
                    const isMaster = Boolean(mat.isDefault);

                    return (
                      <div
                        key={mat.id}
                        className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-all ${
                          isActive
                            ? 'bg-emerald-50/40 border-emerald-400 shadow-sm ring-1 ring-emerald-400/40'
                            : 'bg-white border-[#1F3A5F]/15 hover:border-[#1F3A5F]/35 shadow-2xs'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                isActive
                                  ? 'bg-emerald-600 text-white font-extrabold'
                                  : isMaster
                                  ? 'bg-[#1F3A5F] text-white'
                                  : 'bg-[#FFF7EC] text-[#F28C28] border border-[#F28C28]/30 font-semibold'
                              }`}
                            >
                              {isActive ? '✓ AKTIF SEKARANG' : mat.category || (isMaster ? 'Kurikulum Master' : 'Materi Kustom')}
                            </span>
                            <span className="text-[11px] text-[#1F3A5F]/50 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(mat.updatedAt).toLocaleDateString('id-ID')}
                            </span>
                          </div>

                          <h4 className="font-display font-extrabold text-sm sm:text-base text-[#1F3A5F] line-clamp-2">
                            {mat.seminarTitle}
                          </h4>

                          <p className="text-xs text-[#1F3A5F]/70 line-clamp-2 leading-relaxed">
                            {mat.description || `Materi diselenggarakan oleh ${mat.organizerName}`}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[#1F3A5F]/65">
                            <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                              🖥️ {mat.content.slides?.length || 0} Slide
                            </span>
                            <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                              📝 {mat.content.questions?.length || 0} Soal
                            </span>
                            <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                              📊 {mat.content.polls?.length || 0} Polling
                            </span>
                          </div>
                        </div>

                        {/* Card Action Buttons */}
                        <div className="pt-4 border-t border-[#1F3A5F]/10 mt-4 flex items-center justify-between gap-2">
                          {isActive ? (
                            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 py-1">
                              <Check className="w-4 h-4 text-emerald-600" />
                              Sedang Ditampilkan
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={activatingId === mat.id}
                              onClick={() => handleActivate(mat)}
                              className="px-3.5 py-2 rounded-xl bg-[#2A9D8F] hover:bg-[#218276] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                            >
                              <PlayCircle className="w-3.5 h-3.5" />
                              <span>{activatingId === mat.id ? 'Memuat...' : 'Jadikan Materi Aktif'}</span>
                            </button>
                          )}

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                onEditMaterialInEditor(mat);
                                onClose();
                              }}
                              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#1F3A5F] text-xs font-bold transition-colors cursor-pointer"
                              title="Buka dan sunting di Editor Materi"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDuplicate(mat)}
                              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#1F3A5F] text-xs font-bold transition-colors cursor-pointer"
                              title="Duplikasi / Salin materi ini"
                            >
                              <Copy className="w-3.5 h-3.5 text-[#F28C28]" />
                            </button>

                            <button
                              type="button"
                              onClick={() => downloadMaterialAsJson(mat)}
                              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#1F3A5F] text-xs font-bold transition-colors cursor-pointer"
                              title="Unduh file JSON materi ini"
                            >
                              <Download className="w-3.5 h-3.5 text-slate-600" />
                            </button>

                            {!isMaster && (
                              <>
                                {confirmDeleteId === mat.id ? (
                                  <div className="flex items-center gap-1 bg-rose-50 border border-rose-300 px-2 py-1 rounded-lg">
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        await onDeleteMaterial(mat.id);
                                        setConfirmDeleteId(null);
                                      }}
                                      className="text-[11px] font-bold text-rose-700 hover:underline cursor-pointer"
                                    >
                                      Ya, Hapus
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteId(null)}
                                      className="text-[11px] text-slate-600 hover:underline cursor-pointer"
                                    >
                                      Batal
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(mat.id)}
                                    className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 text-xs transition-colors cursor-pointer"
                                    title="Hapus materi ini dari Bank Materi"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Create New Material Form */
            <form onSubmit={handleCreateSubmit} className="space-y-6 max-w-3xl mx-auto">
              <div className="space-y-1">
                <h3 className="font-display font-extrabold text-lg text-[#1F3A5F]">
                  Buat Materi / Modul Pelatihan Baru
                </h3>
                <p className="text-xs text-[#1F3A5F]/70">
                  Materi yang saat ini ada tidak akan terhapus. Kamu bisa beralih materi kapan pun dengan satu klik.
                </p>
              </div>

              {/* Source Selection Cards */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1F3A5F]/75">
                  1. Pilih Sumber / Dasar Materi Baru
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Option: Packaging Design & Marketing UMKM */}
                  <div
                    onClick={() => {
                      setCreationSource('template_packaging');
                      if (!newTitle) {
                        setNewTitle('Pentingnya Desain Kemasan Sebagai Penunjang Pemasaran Bagi UMKM');
                      }
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer sm:col-span-2 ${
                      creationSource === 'template_packaging'
                        ? 'border-[#E76F51] bg-[#FFF5F2] shadow-xs ring-1 ring-[#E76F51]/30'
                        : 'border-[#1F3A5F]/15 hover:border-[#E76F51]/50 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🎁</span>
                        <span className="font-bold text-sm text-[#1F3A5F]">
                          Template Desain Kemasan Sebagai Penunjang Pemasaran UMKM
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold text-[#E76F51] bg-[#FFF5F2] px-2 py-0.5 rounded border border-[#E76F51]/30">
                        ⭐ Rekomendasi Ahli Desain & Marketing
                      </span>
                    </div>
                    <p className="text-xs text-[#1F3A5F]/75 leading-relaxed">
                      Kurikulum lengkap siap pakai: 7 lembar kerja evaluasi kemasan, 2 polling interaktif, dan 17 slide presentasi visual (salesperson senyap, hukum 3 detik di rak, anatomi 5 elemen label, psikologi warna, dan rencana aksi 30 hari).
                    </p>
                  </div>

                  {/* Option: Duplicate Active */}
                  <div
                    onClick={() => setCreationSource('duplicate_active')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      creationSource === 'duplicate_active'
                        ? 'border-[#F28C28] bg-[#FFF7EC] shadow-xs'
                        : 'border-[#1F3A5F]/15 hover:border-[#1F3A5F]/35 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Sparkles className="w-4 h-4 text-[#F28C28]" />
                      <span className="font-bold text-sm text-[#1F3A5F]">
                        Duplikat dari Materi Aktif
                      </span>
                    </div>
                    <p className="text-xs text-[#1F3A5F]/70 leading-relaxed">
                      Menyalin susunan tema, warna, dan struktur materi aktif saat ini: "{currentActiveMaterial.seminarTitle.slice(0, 38)}...".
                    </p>
                    <span className="inline-block mt-2 text-[10px] font-extrabold text-[#F28C28] bg-white px-2 py-0.5 rounded border border-[#F28C28]/30">
                      Disarankan untuk Sesi Lanjutan
                    </span>
                  </div>

                  {/* Option: Sesi 2 Action Plan Preset */}
                  <div
                    onClick={() => {
                      setCreationSource('template_sesi_2');
                      if (!newTitle) {
                        setNewTitle('Sesi 2: Rencana Aksi, Strategi Harga & Penjualan UMKM');
                      }
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      creationSource === 'template_sesi_2'
                        ? 'border-[#2A9D8F] bg-teal-50/50 shadow-xs'
                        : 'border-[#1F3A5F]/15 hover:border-[#1F3A5F]/35 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <FileText className="w-4 h-4 text-[#2A9D8F]" />
                      <span className="font-bold text-sm text-[#1F3A5F]">
                        Template Kurikulum Sesi 2
                      </span>
                    </div>
                    <p className="text-xs text-[#1F3A5F]/70 leading-relaxed">
                      Dirancang khusus untuk pelatihan minggu depan: 5 soal lembar kerja harga & SOP chat WhatsApp, 10 slide interaktif, dan komitmen aksi 14 hari.
                    </p>
                    <span className="inline-block mt-2 text-[10px] font-extrabold text-[#2A9D8F] bg-white px-2 py-0.5 rounded border border-[#2A9D8F]/30">
                      Siap Pakai Minggu Depan
                    </span>
                  </div>

                  {/* Option: Master PartnerUp Sesi 1 */}
                  <div
                    onClick={() => {
                      setCreationSource('template_sesi_1');
                      if (!newTitle) {
                        setNewTitle('Pelatihan UMKM: Value Proposition & Diferensiasi (Batch Baru)');
                      }
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      creationSource === 'template_sesi_1'
                        ? 'border-[#1F3A5F] bg-slate-50 shadow-xs'
                        : 'border-[#1F3A5F]/15 hover:border-[#1F3A5F]/35 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <BookOpen className="w-4 h-4 text-[#1F3A5F]" />
                      <span className="font-bold text-sm text-[#1F3A5F]">
                        Kurikulum PartnerUp Asli
                      </span>
                    </div>
                    <p className="text-xs text-[#1F3A5F]/70 leading-relaxed">
                      Mulai dari materi master 8 pertanyaan dan 17 slide lengkap seputar Value Proposition.
                    </p>
                  </div>

                  {/* Option: Blank Canvas */}
                  <div
                    onClick={() => setCreationSource('blank')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      creationSource === 'blank'
                        ? 'border-indigo-500 bg-indigo-50/50 shadow-xs'
                        : 'border-[#1F3A5F]/15 hover:border-[#1F3A5F]/35 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <RotateCcw className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold text-sm text-[#1F3A5F]">
                        Kanvas Bersih / Minimalis
                      </span>
                    </div>
                    <p className="text-xs text-[#1F3A5F]/70 leading-relaxed">
                      Template kosong berisi 2 pertanyaan awal dan 4 slide praktis untuk topik seminar baru bebas.
                    </p>
                  </div>

                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-4 bg-[#FFF7EC]/70 p-5 rounded-2xl border border-[#1F3A5F]/15">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#1F3A5F]/80 mb-1">
                    Judul / Topik Materi Baru *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    placeholder="Contoh: Pelatihan Sesi 2: Strategi Harga & Penjualan UMKM"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full rounded-xl border border-[#1F3A5F]/25 bg-white px-3.5 py-2.5 text-sm font-bold text-[#1F3A5F] focus:outline-hidden focus:ring-2 focus:ring-[#F28C28]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#1F3A5F]/80 mb-1">
                      Penyelenggara / Program
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      value={newOrganizer}
                      onChange={(e) => setNewOrganizer(e.target.value)}
                      className="w-full rounded-xl border border-[#1F3A5F]/25 bg-white px-3.5 py-2 text-sm font-semibold text-[#1F3A5F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#1F3A5F]/80 mb-1">
                      Catatan / Deskripsi Singkat
                    </label>
                    <input
                      type="text"
                      maxLength={200}
                      placeholder="Contoh: Sesi lanjutan minggu kedua untuk UMKM Batch 1"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full rounded-xl border border-[#1F3A5F]/25 bg-white px-3.5 py-2 text-sm text-[#1F3A5F]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoActivateNew}
                      onChange={(e) => setAutoActivateNew(e.target.checked)}
                      className="w-4 h-4 rounded text-[#F28C28] focus:ring-[#F28C28] cursor-pointer"
                    />
                    <span className="text-xs font-bold text-[#1F3A5F]">
                      Langsung jadikan materi ini sebagai Materi Aktif di layar presentasi & HP peserta
                    </span>
                  </label>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2.5 rounded-xl border border-[#1F3A5F]/20 text-xs font-bold text-[#1F3A5F] hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newTitle.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[#F28C28] hover:bg-[#d9771e] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSubmitting ? 'Membuat...' : 'Buat & Simpan ke Bank Materi'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-[#FFF7EC] px-6 py-3 border-t border-[#1F3A5F]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#1F3A5F]/75 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Semua materi tersimpan otomatis di perangkat & Cloud Firestore secara permanen.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#1F3A5F] hover:bg-[#162a45] text-white text-xs font-bold cursor-pointer transition-colors"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
};
