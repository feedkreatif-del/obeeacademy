import { ProgramFormatType, SavedMaterial } from '../types';
import { SlideDefinition, WorksheetQuestion } from '../data/seminarData';
import { PROGRAM_FORMAT_META } from './programTier';

function stripTierPrefix(title: string): string {
  return (title || '')
    .replace(/^(Seminar Dasar|Workshop Praktik|Coaching Intensif|Workshop|Coaching|Seminar)\s*:\s*/i, '')
    .trim();
}

/**
 * 1-Klik Buat Draf Varian Kurikulum (Seminar / Workshop / Coaching) dari modul induk.
 * Hasilnya siap disimpan ke Bank Materi & otomatis ditautkan ke jenjang terkait.
 */
export function buildTierVariantMaterialDraft(
  sourceMaterial: SavedMaterial,
  targetFormat: ProgramFormatType
): SavedMaterial {
  const now = Date.now();
  const newId = `mat_${targetFormat}_${now.toString(36)}_${Math.random().toString(36).slice(2, 5)}`;
  const meta = PROGRAM_FORMAT_META[targetFormat];
  const baseTitle = stripTierPrefix(sourceMaterial.seminarTitle);

  const prefixLabel =
    targetFormat === 'workshop'
      ? 'Workshop Praktik: '
      : targetFormat === 'coaching'
      ? 'Coaching Intensif: '
      : 'Seminar Dasar: ';
  const newTitle = `${prefixLabel}${baseTitle}`.slice(0, 120);

  const rawQuestions: WorksheetQuestion[] = (sourceMaterial.content.questions || []).map((q) => ({
    ...q,
    helperTips: Array.isArray(q.helperTips) ? [...q.helperTips] : [],
  }));

  const rawSlides = (sourceMaterial.content.slides || []).map((s) => ({
    ...s,
    cards: s.cards ? s.cards.map((c) => ({ ...c })) : undefined,
    promptLines: s.promptLines ? [...s.promptLines] : undefined,
    comparison: s.comparison ? { ...s.comparison } : undefined,
  }));

  const rawPolls = (sourceMaterial.content.polls || []).map((p) => ({
    ...p,
    options: p.options ? p.options.map((o) => ({ ...o })) : [],
  }));

  let nextQuestions: WorksheetQuestion[] = rawQuestions;
  let nextSlides: SlideDefinition[] = rawSlides;

  // Sesuaikan slide sampul (index 0)
  if (nextSlides.length > 0) {
    nextSlides[0] = {
      ...nextSlides[0],
      badge: meta.shortBadge,
      title: newTitle,
      subtitle:
        targetFormat === 'workshop'
          ? '80% Praktik Langsung, Bedah Karya & Output Siap Terap di Tempat'
          : targetFormat === 'coaching'
          ? 'Audit Kasus Spesifik, Hot-Seat Pendampingan & Action Plan 30 Hari'
          : 'Pengenalan Konsep Inti, Kerangka Pikir & Pemetaan Strategi',
    };
  }

  // Tambahkan 1 lembar kerja & 1 slide praktik khusus jenjang jika belum penuh batas Firestore
  if (targetFormat === 'workshop' && nextQuestions.length < 24 && nextSlides.length < 39) {
    const newQIndex = nextQuestions.length;
    const newSlideIndex = nextSlides.length;

    nextQuestions = [
      ...nextQuestions,
      {
        index: newQIndex,
        sectionNumber: newQIndex + 1,
        sectionTitle: `${newQIndex + 1}. Output Praktik Langsung Workshop`,
        coreLearning:
          'Peserta membawa pulang hasil kerja nyata yang langsung dikoreksi dan dipoles di sesi workshop',
        questionText: `Tuliskan ringkasan hasil praktik atau perubahan nyata yang baru saja kamu eksekusi untuk materi "${baseTitle}":`,
        secondaryPrompt:
          'Sebutkan 1 bagian yang paling siap langsung dipublikasikan/dipakai minggu ini + 1 hal yang ingin direview mentor.',
        exampleAnswer:
          'Sudah mempraktikkan draf final langsung di workshop — siap dipublikasikan minggu ini dan mohon koreksi bagian hook penawarannya.',
        helperTips: [
          'Gunakan waktu workshop untuk menyelesaikan 1 output utuh, bukan hanya mencatat teori.',
          'Minta masukan spesifik dari mentor sebelum sesi selesai.',
        ],
        linkedSlideIndex: newSlideIndex,
      },
    ];

    nextSlides = [
      ...nextSlides,
      {
        index: newSlideIndex,
        pageNumber: newSlideIndex + 1,
        badge: 'OUTPUT WORKSHOP PRAKTIK',
        title: 'Finalisasi Output Karya & Review Mentor',
        subtitle:
          'Pastikan setiap peserta membawa pulang 1 hasil praktik siap pakai sebelum kelas ditutup:',
        type: 'worksheet',
        linkedQuestionIndex: newQIndex,
        cards: [
          {
            title: '1. Cek Kelayakan Output',
            body: 'Pastikan hasil praktikmu sudah jelas target pembelinya dan siap langsung dipakai.',
            accent: 'orange',
          },
          {
            title: '2. Bedah & Koreksi Cepat',
            body: 'Tampilkan di layar untuk mendapat koreksi langsung dari mentor & rekan peserta.',
            accent: 'teal',
          },
        ],
        promptLines: ['Ringkasan output siap pakai + bagian yang perlu direview mentor: ______________'],
      },
    ];
  } else if (targetFormat === 'coaching' && nextQuestions.length < 24 && nextSlides.length < 39) {
    const newQIndex = nextQuestions.length;
    const newSlideIndex = nextSlides.length;

    nextQuestions = [
      ...nextQuestions,
      {
        index: newQIndex,
        sectionNumber: newQIndex + 1,
        sectionTitle: `${newQIndex + 1}. Audit Kasus Spesifik & Action Plan 30 Hari`,
        coreLearning:
          'Pendampingan coaching berfokus pada solusi tepat sasaran sesuai kondisi aset, tim, & target klien saat ini',
        questionText: `Apa 1 hambatan paling mendesak terkait "${baseTitle}" yang ingin diaudit hari ini, dan apa 3 target terukur dalam 30 hari ke depan?`,
        secondaryPrompt:
          'Tuliskan kondisi saat ini secara jujur (kendala utama + angka/target yang ingin dikejar 30 hari).',
        exampleAnswer:
          'Kendala utama: eksekusi tim belum konsisten. Target 30 hari: terapkan SOP baru minggu 1, uji ke 10 prospek minggu 2–3, evaluasi minggu 4.',
        helperTips: [
          'Siapkan data nyata atau akun/produk asli agar mentor bisa langsung membedah titik bocornya.',
          'Kunci tanggal evaluasi mingguan agar rencana 30 hari benar-benar berjalan.',
        ],
        linkedSlideIndex: newSlideIndex,
      },
    ];

    nextSlides = [
      ...nextSlides,
      {
        index: newSlideIndex,
        pageNumber: newSlideIndex + 1,
        badge: 'SESI AUDIT & ROADMAP COACHING',
        title: 'Audit Kasus Spesifik & Rencana Aksi 30 Hari',
        subtitle:
          'Ubah hasil audit coaching hari ini menjadi jadwal eksekusi mingguan yang terukur:',
        type: 'closing',
        linkedQuestionIndex: newQIndex,
        cards: [
          {
            title: 'Minggu 1: Perbaikan Pondasi',
            body: 'Bereskan 1 titik bocor paling krusial yang ditemukan dalam sesi audit hari ini.',
            accent: 'orange',
          },
          {
            title: 'Minggu 2–3: Uji Coba & Eksekusi',
            body: 'Terapkan strategi baru secara konsisten pada produk/layanan prioritas.',
            accent: 'teal',
          },
          {
            title: 'Minggu 4: Evaluasi Angka',
            body: 'Bandingkan hasil sebelum vs sesudah coaching bersama mentor.',
            accent: 'orange',
          },
        ],
        promptLines: ['1 Hambatan Utama + 3 Target Aksi 30 Hari Ke Depan: ______________'],
      },
    ];
  }

  const description =
    targetFormat === 'workshop'
      ? `Varian Workshop Praktik dari "${baseTitle}": fokus latihan langsung, studi kasus & output siap pakai (${nextSlides.length} slide, ${nextQuestions.length} praktik).`
      : targetFormat === 'coaching'
      ? `Varian Coaching Eksklusif dari "${baseTitle}": audit kasus mendalam, konsultasi spesifik & action plan 30 hari (${nextSlides.length} slide, ${nextQuestions.length} lembar audit).`
      : `Varian Seminar Dasar dari "${baseTitle}": pemahaman konsep inti & strategi fundamental (${nextSlides.length} slide).`;

  const category = `${sourceMaterial.category || 'Materi'} · ${meta.label}`.slice(0, 60);

  return {
    id: newId,
    seminarTitle: newTitle,
    organizerName: sourceMaterial.organizerName,
    description: description.slice(0, 300),
    category,
    isDefault: false,
    createdAt: now,
    updatedAt: now,
    content: {
      ...sourceMaterial.content,
      seminarTitle: newTitle,
      organizerName: sourceMaterial.organizerName,
      questions: nextQuestions,
      polls: rawPolls,
      slides: nextSlides,
      materialId: newId,
      description: description.slice(0, 300),
      category,
      isDefault: false,
      createdAt: now,
      updatedAt: now,
    },
  };
}
