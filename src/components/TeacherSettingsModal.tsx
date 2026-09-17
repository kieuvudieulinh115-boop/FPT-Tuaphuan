import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Settings,
  X,
  Clock,
  Gauge,
  ListFilter,
  FileText,
  Image as ImageIcon,
  School,
  Upload,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertTriangle,
  MoveUp,
  MoveDown,
  RotateCcw,
  Sparkles,
  Save,
  CheckCircle2,
  Search,
  Filter,
  Layers,
  FolderCheck,
  Copy,
  FolderPlus
} from 'lucide-react';
import { TeacherSettingsConfig, Question, PuzzlePiece, ChallengeId, QuestionSet } from '../types';
import { CHALLENGE_LIBRARY } from '../data/challenges';
import { PUZZLE_THEMES } from '../data/puzzleThemes';
import { DEFAULT_QUESTION_SETS } from '../data/questionSets';
import { downloadSampleQuestionsWordDoc, downloadSampleQuestionsDocx } from '../data/sampleQuestionTemplate';
import { QuestionImporter } from '../services/importers/QuestionImporter';
import { audioManager } from '../services/audio/AudioManager';
import { dbService } from '../services/storage/IndexedDBService';

interface TeacherSettingsModalProps {
  isOpen: boolean;
  currentSettings: TeacherSettingsConfig;
  questions: Question[];
  puzzlePieces: PuzzlePiece[];
  onSaveSettings: (settings: TeacherSettingsConfig) => Promise<void>;
  onSaveQuestions: (questions: Question[]) => Promise<void>;
  onSavePuzzlePieces: (pieces: PuzzlePiece[]) => Promise<void>;
  onResetDefaults: () => Promise<void>;
  onClose: () => void;
}

export const TeacherSettingsModal: React.FC<TeacherSettingsModalProps> = ({
  isOpen,
  currentSettings,
  questions,
  puzzlePieces,
  onSaveSettings,
  onSaveQuestions,
  onSavePuzzlePieces,
  onResetDefaults,
  onClose
}) => {
  // Default to question sets tab as shown in user screenshot
  const [activeTab, setActiveTab] = useState<'questions' | 'puzzle' | 'rules' | 'challenges' | 'school'>('questions');

  // Form states
  const [settings, setSettings] = useState<TeacherSettingsConfig>(currentSettings);
  const [pieces, setPieces] = useState<PuzzlePiece[]>(puzzlePieces);

  // Question sets state
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>(DEFAULT_QUESTION_SETS);
  const [activeSetId, setActiveSetId] = useState<string>(
    currentSettings.activeQuestionSetId || 'set_lop3_tinhoc'
  );

  // Active question set & working question list
  const activeQuestionSet = useMemo(() => {
    return questionSets.find(s => s.id === activeSetId) || questionSets[0] || {
      id: 'default',
      title: 'Bộ câu hỏi mặc định',
      gradeBadge: 'STEM',
      category: 'Khoa học & Công nghệ',
      isSaved: true,
      createdAt: Date.now(),
      questions
    };
  }, [questionSets, activeSetId, questions]);

  const [currentQuestions, setCurrentQuestions] = useState<Question[]>(activeQuestionSet.questions);

  // Filter & Search states
  const [correctOptionFilter, setCorrectOptionFilter] = useState<'ALL' | 'A' | 'B' | 'C' | 'D' | 'NEEDS_CHECK'>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Modals & Editing states
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingSetMetadata, setEditingSetMetadata] = useState<QuestionSet | null>(null);
  const [newSetFromImport, setNewSetFromImport] = useState<{
    open: boolean;
    questions: Question[];
    title: string;
    gradeBadge: string;
    category: string;
    isSaved: boolean;
  }>({
    open: false,
    questions: [],
    title: '',
    gradeBadge: 'Lớp 3',
    category: 'Tin học & Công nghệ',
    isSaved: true
  });

  const [importStatus, setImportStatus] = useState<string>('');
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('');

  const docInputRef = useRef<HTMLInputElement | null>(null);
  const singleImageInputRef = useRef<HTMLInputElement | null>(null);
  const fullImageSliceRef = useRef<HTMLInputElement | null>(null);
  const [replacingPieceId, setReplacingPieceId] = useState<number | null>(null);

  // Load question sets on open
  useEffect(() => {
    if (!isOpen) return;
    async function loadData() {
      try {
        const [savedSets, savedActiveId] = await Promise.all([
          dbService.getQuestionSets(),
          dbService.getActiveQuestionSetId()
        ]);
        if (savedSets && savedSets.length > 0) {
          setQuestionSets(savedSets);
          const targetId = settings.activeQuestionSetId || savedActiveId || savedSets[0].id;
          setActiveSetId(targetId);
          const target = savedSets.find(s => s.id === targetId) || savedSets[0];
          if (target) {
            setCurrentQuestions(target.questions);
          }
        }
      } catch (err) {
        console.warn('Could not load question sets from db:', err);
      }
    }
    loadData();
  }, [isOpen, settings.activeQuestionSetId]);

  // Keep currentQuestions in sync when switching active set
  const handleSelectSet = (setId: string) => {
    audioManager.playClick();
    setActiveSetId(setId);
    const target = questionSets.find(s => s.id === setId);
    if (target) {
      setCurrentQuestions(target.questions);
      // Auto-save active ID
      dbService.setActiveQuestionSetId(setId);
      setSettings(prev => ({ ...prev, activeQuestionSetId: setId }));
      onSaveQuestions(target.questions);
      setSaveMessage(`Đã chuyển sang bộ: "${target.title}"`);
      setTimeout(() => setSaveMessage(''), 2500);
    }
  };

  // Save All Settings
  const handleSaveAll = async () => {
    audioManager.playClick();

    // 1. Update current set's questions in questionSets state
    const updatedSets = questionSets.map(s =>
      s.id === activeSetId ? { ...s, questions: currentQuestions, updatedAt: Date.now() } : s
    );
    setQuestionSets(updatedSets);

    // 2. Persist question sets to IndexedDB & localStorage
    await dbService.saveQuestionSets(updatedSets);
    await dbService.setActiveQuestionSetId(activeSetId);

    // 3. Save current settings & questions for student session
    await onSaveSettings({ ...settings, activeQuestionSetId: activeSetId });
    await onSaveQuestions(currentQuestions);
    await onSavePuzzlePieces(pieces);

    setSaveMessage('Đã lưu toàn bộ cấu hình và bộ câu hỏi thành công!');
    setTimeout(() => setSaveMessage(''), 2500);
  };

  // Toggle Challenge ID
  const handleToggleChallenge = (id: ChallengeId) => {
    setSettings(prev => {
      const exists = prev.enabledChallenges.includes(id);
      if (exists) {
        if (prev.enabledChallenges.length <= 1) return prev;
        return { ...prev, enabledChallenges: prev.enabledChallenges.filter(c => c !== id) };
      } else {
        return { ...prev, enabledChallenges: [...prev.enabledChallenges, id] };
      }
    });
  };

  // Quick 1-click correct option selector on the list
  const handleQuickChangeCorrectOption = (questionId: string, opt: 'A' | 'B' | 'C' | 'D') => {
    audioManager.playClick();
    setCurrentQuestions(prev =>
      prev.map(q =>
        q.id === questionId
          ? { ...q, correctOption: opt, needsTeacherConfirmation: false }
          : q
      )
    );
  };

  // Delete question from active set
  const handleDeleteQuestion = (id: string) => {
    audioManager.playClick();
    setCurrentQuestions(prev => prev.filter(q => q.id !== id));
  };

  // Move question up or down
  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    audioManager.playClick();
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= currentQuestions.length) return;
    const next = [...currentQuestions];
    const [moved] = next.splice(index, 1);
    next.splice(targetIdx, 0, moved);
    setCurrentQuestions(next);
  };

  // Save changes to current QuestionSet
  const handleSaveCurrentSetQuestions = async () => {
    audioManager.playClick();
    const updatedSets = questionSets.map(s =>
      s.id === activeSetId ? { ...s, questions: currentQuestions, updatedAt: Date.now(), isSaved: true } : s
    );
    setQuestionSets(updatedSets);
    await dbService.saveQuestionSets(updatedSets);
    await onSaveQuestions(currentQuestions);
    setSaveMessage('Đã lưu các thay đổi vào bộ câu hỏi thành công!');
    setTimeout(() => setSaveMessage(''), 2500);
  };

  // Duplicate a QuestionSet
  const handleDuplicateSet = async (set: QuestionSet) => {
    audioManager.playClick();
    const newId = `set_copy_${Date.now()}`;
    const duplicated: QuestionSet = {
      ...set,
      id: newId,
      title: `${set.title} (Bản sao)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isSaved: true
    };
    const nextSets = [...questionSets, duplicated];
    setQuestionSets(nextSets);
    await dbService.saveQuestionSets(nextSets);
    handleSelectSet(newId);
  };

  // Delete a QuestionSet
  const handleDeleteSet = async (setId: string) => {
    audioManager.playClick();
    if (questionSets.length <= 1) {
      alert('Không thể xóa bộ câu hỏi duy nhất còn lại.');
      return;
    }
    if (!confirm('Bạn có chắc chắn muốn xóa bộ câu hỏi này khỏi kho không?')) return;

    const nextSets = questionSets.filter(s => s.id !== setId);
    setQuestionSets(nextSets);
    await dbService.saveQuestionSets(nextSets);

    if (activeSetId === setId) {
      handleSelectSet(nextSets[0].id);
    }
  };

  // File import for DOCX / PDF
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus(`Đang đọc tệp ${file.name}...`);

    try {
      const text = await QuestionImporter.extractTextFromFile(file);
      setImportStatus('Đang phân tích câu hỏi, phương án A-B-C-D và đáp án...');
      const result = await QuestionImporter.parseQuestionsText(text);

      if (result.questions.length === 0) {
        setImportStatus('Không tìm thấy câu hỏi hợp lệ trong tệp. Hãy kiểm tra định dạng: Câu 1: ... A. ... B. ... C. ... D. ... Đáp án: B');
      } else {
        const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        let detectedGrade = 'Lớp 3';
        if (fileNameWithoutExt.toLowerCase().includes('lớp 4') || fileNameWithoutExt.toLowerCase().includes('lop 4')) detectedGrade = 'Lớp 4';
        if (fileNameWithoutExt.toLowerCase().includes('lớp 5') || fileNameWithoutExt.toLowerCase().includes('lop 5')) detectedGrade = 'Lớp 5';
        if (fileNameWithoutExt.toLowerCase().includes('stem')) detectedGrade = 'STEM';

        setNewSetFromImport({
          open: true,
          questions: result.questions,
          title: fileNameWithoutExt,
          gradeBadge: detectedGrade,
          category: 'Tin học & Công nghệ',
          isSaved: true
        });

        setImportStatus(`Đã trích xuất ${result.questions.length} câu hỏi! Vui lòng lưu vào kho.`);
      }
    } catch (err: unknown) {
      console.error('Import error:', err);
      setImportStatus('Lỗi khi đọc tệp. Hãy chắc chắn tệp DOCX, PDF hoặc TXT chứa nội dung văn bản.');
    } finally {
      setIsImporting(false);
      if (docInputRef.current) docInputRef.current.value = '';
    }
  };

  // Confirm creation of new QuestionSet from import or manual
  const handleConfirmCreateSet = async () => {
    audioManager.playClick();
    const newId = `set_${Date.now()}`;
    const newSet: QuestionSet = {
      id: newId,
      title: newSetFromImport.title.trim() || `Bộ câu hỏi mới ${questionSets.length + 1}`,
      gradeBadge: newSetFromImport.gradeBadge.trim() || 'Lớp 3',
      category: newSetFromImport.category.trim() || 'Tin học',
      description: `Đã nhập ${newSetFromImport.questions.length} câu hỏi vào ngày ${new Date().toLocaleDateString('vi-VN')}`,
      questions: newSetFromImport.questions,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isSaved: newSetFromImport.isSaved
    };

    const nextSets = [...questionSets, newSet];
    setQuestionSets(nextSets);
    if (newSetFromImport.isSaved) {
      await dbService.saveQuestionSets(nextSets);
    }

    setNewSetFromImport(prev => ({ ...prev, open: false }));
    handleSelectSet(newId);
    setSaveMessage(`Đã tạo và kích hoạt bộ câu hỏi: "${newSet.title}"`);
    setTimeout(() => setSaveMessage(''), 2500);
  };

  // Save Set Metadata Edit
  const handleSaveSetMetadata = async () => {
    if (!editingSetMetadata) return;
    audioManager.playClick();
    const updatedSets = questionSets.map(s =>
      s.id === editingSetMetadata.id ? { ...editingSetMetadata, updatedAt: Date.now() } : s
    );
    setQuestionSets(updatedSets);
    await dbService.saveQuestionSets(updatedSets);
    setEditingSetMetadata(null);
    setSaveMessage('Đã cập nhật thông tin bộ câu hỏi!');
    setTimeout(() => setSaveMessage(''), 2500);
  };

  // Filter & Search Logic for Questions
  const filteredQuestions = useMemo(() => {
    return currentQuestions.filter(q => {
      // 1. Correct Option Filter
      if (correctOptionFilter === 'A' && q.correctOption !== 'A') return false;
      if (correctOptionFilter === 'B' && q.correctOption !== 'B') return false;
      if (correctOptionFilter === 'C' && q.correctOption !== 'C') return false;
      if (correctOptionFilter === 'D' && q.correctOption !== 'D') return false;
      if (correctOptionFilter === 'NEEDS_CHECK' && !q.needsTeacherConfirmation && q.correctOption) return false;

      // 2. Keyword Search
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase().trim();
        const contentMatch = q.content.toLowerCase().includes(kw);
        const optMatch = Object.values(q.options).some(optText => String(optText).toLowerCase().includes(kw));
        const subMatch = q.subject?.toLowerCase().includes(kw);
        if (!contentMatch && !optMatch && !subMatch) return false;
      }

      return true;
    });
  }, [currentQuestions, correctOptionFilter, searchKeyword]);

  // Question stats
  const countA = currentQuestions.filter(q => q.correctOption === 'A').length;
  const countB = currentQuestions.filter(q => q.correctOption === 'B').length;
  const countC = currentQuestions.filter(q => q.correctOption === 'C').length;
  const countD = currentQuestions.filter(q => q.correctOption === 'D').length;
  const countNeedsCheck = currentQuestions.filter(q => q.needsTeacherConfirmation || !q.correctOption).length;

  // Puzzle Full Image Slicer (cuts 1 uploaded image into 8 puzzle pieces)
  const handleFullImageSlice = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const cols = 4;
        const rows = 2;
        const pieceW = img.width / cols;
        const pieceH = img.height / rows;

        const newPieces: PuzzlePiece[] = [];

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const index = r * cols + c + 1;
            const canvas = document.createElement('canvas');
            canvas.width = pieceW;
            canvas.height = pieceH;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, c * pieceW, r * pieceH, pieceW, pieceH, 0, 0, pieceW, pieceH);
              newPieces.push({
                id: index,
                position: index,
                unlocked: false,
                imageUrl: canvas.toDataURL('image/jpeg', 0.9),
                label: `Mảnh ghép #${index}`
              });
            }
          }
        }

        setPieces(newPieces);
        setSaveMessage('Đã cắt ảnh lớn thành 9 mảnh ghép bí ẩn thành công!');
        setTimeout(() => setSaveMessage(''), 2500);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    if (fullImageSliceRef.current) fullImageSliceRef.current.value = '';
  };

  // Replace Single Piece Image
  const handleSinglePieceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replacingPieceId === null) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPieces(prev =>
        prev.map(p => (p.position === replacingPieceId ? { ...p, imageUrl: dataUrl } : p))
      );
      setReplacingPieceId(null);
    };
    reader.readAsDataURL(file);
    if (singleImageInputRef.current) singleImageInputRef.current.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-[0_0_60px_rgba(30,58,138,0.3)] my-auto max-h-[94vh] flex flex-col overflow-hidden text-slate-100">
        
        {/* MODAL TOP HEADER */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0d1424] border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md">
              <Settings className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Bảng Quản Lý Dành Cho Giáo Viên
              </h2>
              <p className="text-xs text-slate-400">
                Tải file câu hỏi, quản lý tranh bí ẩn 8 mảnh và cài đặt trận đấu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {saveMessage && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-950/90 px-3 py-1.5 rounded-xl border border-emerald-500/40 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {saveMessage}
              </span>
            )}
            <button
              id="teacher-save-btn"
              type="button"
              onClick={handleSaveAll}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>LƯU CẤU HÌNH</span>
            </button>
            <button
              id="teacher-close-btn"
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-2 px-6 py-2 bg-[#090f1d] border-b border-slate-800 shrink-0 overflow-x-auto">
          {[
            { id: 'questions', label: 'Bộ câu hỏi trắc nghiệm', icon: FileText },
            { id: 'puzzle', label: 'Tranh bí ẩn (Lưới 4×2)', icon: ImageIcon },
            { id: 'rules', label: 'Cài đặt thời gian', icon: Clock },
            { id: 'challenges', label: '12 Thử thách khuôn mặt', icon: ListFilter },
            { id: 'school', label: 'Giấy khen & Trường học', icon: School }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                activeTab === id
                  ? 'border-indigo-500 text-indigo-300 bg-indigo-950/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* TAB CONTENT CONTAINER */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: BỘ CÂU HỎI TRẮC NGHIỆM */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              
              {/* TOP SECTION: 2 CARDS (DROPDOWN + UPLOAD DOCX/PDF) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* LEFT CARD: CHỌN BỘ CÂU HỎI ĐANG THI ĐẤU */}
                <div className="bg-[#0b1329] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase mb-2 flex items-center gap-1.5">
                      <FolderCheck className="w-4 h-4 text-indigo-400" />
                      <span>CHỌN BỘ CÂU HỎI ĐANG THI ĐẤU:</span>
                    </h3>

                    {/* Styled Select Dropdown */}
                    <select
                      value={activeSetId}
                      onChange={(e) => handleSelectSet(e.target.value)}
                      className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs sm:text-sm font-medium outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                    >
                      {questionSets.map(set => (
                        <option key={set.id} value={set.id}>
                          [{set.gradeBadge}] {set.title} ({set.questions.length} câu)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400">
                      Số câu hiện có: <strong className="text-indigo-300">{currentQuestions.length}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                        Lĩnh vực: {activeQuestionSet.category}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                        activeQuestionSet.isSaved
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                          : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                      }`}>
                        {activeQuestionSet.isSaved ? '✓ Đã lưu vào kho' : 'Bản nháp'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RIGHT CARD: TẢI LÊN FILE CÂU HỎI WORD (.DOCX) HOẶC PDF */}
                <div className="bg-[#0b1329] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        <Upload className="w-4 h-4 text-indigo-400" />
                        <span>Tải lên file câu hỏi Word (.docx) hoặc PDF</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                        Xử lý trực tiếp trong trình duyệt, tự động nhận diện câu hỏi, phương án A-B-C-D và đáp án đúng.
                      </p>
                    </div>

                    <input
                      ref={docInputRef}
                      type="file"
                      accept=".docx,.pdf,.txt"
                      onChange={handleFileImport}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isImporting}
                      onClick={() => docInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all disabled:opacity-50 whitespace-nowrap shrink-0"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{isImporting ? 'Đang đọc...' : 'Chọn file Word / PDF'}</span>
                    </button>
                  </div>

                  {importStatus && (
                    <div className="text-xs font-medium text-indigo-300 bg-slate-900/90 p-2.5 rounded-xl border border-indigo-500/30">
                      {importStatus}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 pt-1 border-t border-slate-800/80">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-400 font-medium">Tệp mẫu chuẩn:</span>
                      <button
                        type="button"
                        onClick={downloadSampleQuestionsWordDoc}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-500/40 rounded-lg text-[11px] font-bold cursor-pointer transition-all hover:scale-105"
                        title="Tải tệp mẫu Word (.doc) có 9 câu hỏi chuẩn để tham khảo hoặc chỉnh sửa"
                      >
                        <span>📥 Tải tệp mẫu Word (.doc)</span>
                      </button>
                      <button
                        type="button"
                        onClick={downloadSampleQuestionsDocx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-[11px] font-semibold cursor-pointer transition-all"
                        title="Tải tệp mẫu Text (.txt)"
                      >
                        <span>📝 Tệp mẫu (.txt)</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setNewSetFromImport({
                          open: true,
                          questions: [],
                          title: 'Bộ câu hỏi tự soạn',
                          gradeBadge: 'Lớp 3',
                          category: 'Tin học & Công nghệ',
                          isSaved: true
                        });
                      }}
                      className="text-indigo-400 hover:underline cursor-pointer flex items-center gap-1 font-semibold shrink-0"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span>+ Tạo bộ mới trống</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* SECTION 2: KHO BỘ CÂU HỎI ĐÃ LƯU */}
              <div className="bg-[#0b1329] border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span>KHO BỘ CÂU HỎI ĐÃ LƯU ({questionSets.length} BỘ)</span>
                  </h3>
                  <span className="text-xs text-slate-400 italic">
                    Bấm vào bộ bất kỳ để chọn bộ câu hỏi đó cho người chơi thi đấu
                  </span>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {questionSets.map((set) => {
                    const isSelected = set.id === activeSetId;
                    return (
                      <div
                        key={set.id}
                        onClick={() => handleSelectSet(set.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative group select-none ${
                          isSelected
                            ? 'bg-indigo-950/30 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/60'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                        }`}
                      >
                        <div>
                          {/* Top Badges */}
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                              {set.gradeBadge}
                            </span>
                            {isSelected ? (
                              <span className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                                ✓ Đang chọn
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500">
                                {set.isSaved ? 'Đã lưu' : 'Bản nháp'}
                              </span>
                            )}
                          </div>

                          {/* Set Title */}
                          <h4 className="text-xs sm:text-sm font-bold text-slate-100 leading-snug line-clamp-2">
                            {set.title}
                          </h4>

                          {/* Category */}
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                            Lĩnh vực: {set.category}
                          </p>
                        </div>

                        {/* Bottom Row */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                          <span className="text-slate-400 font-medium">
                            {set.questions.length} câu
                          </span>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              title="Sửa thông tin bộ (tên, khối, lĩnh vực)"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingSetMetadata(set);
                              }}
                              className="p-1 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Nhân bản bộ câu hỏi"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateSet(set);
                              }}
                              className="p-1 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            {questionSets.length > 1 && (
                              <button
                                type="button"
                                title="Xóa bộ câu hỏi"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSet(set.id);
                                }}
                                className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3: TÍNH NĂNG LỌC CÂU HỎI ĐÚNG VÀ CHỈNH SỬA TRỰC TIẾP TRÊN ĐÓ */}
              <div className="bg-[#0b1329] border border-slate-800 rounded-2xl p-5 space-y-4">
                
                {/* Header & Subtitle */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <Filter className="w-4 h-4 text-indigo-400" />
                      <span>LỌC VÀ CHỈNH SỬA CÂU HỎI TRONG BỘ: "{activeQuestionSet.title}"</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Lọc theo đáp án đúng, kiểm tra phương án và nhấp chọn trực tiếp A, B, C, D để đổi đáp án ngay trên bảng.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const newQ: Question = {
                          id: `q_${Date.now()}`,
                          content: 'Nội dung câu hỏi mới...',
                          options: {
                            A: 'Phương án A',
                            B: 'Phương án B',
                            C: 'Phương án C',
                            D: 'Phương án D'
                          },
                          correctOption: 'A',
                          subject: activeQuestionSet.category
                        };
                        setCurrentQuestions(prev => [newQ, ...prev]);
                        setEditingQuestion(newQ);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Thêm câu hỏi</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveCurrentSetQuestions}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Lưu bộ này</span>
                    </button>
                  </div>
                </div>

                {/* FILTER TOOLBAR: Lọc theo đáp án đúng + Tìm kiếm */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  
                  {/* Correct Option Filter Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Lọc đáp án đúng:</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setCorrectOptionFilter('ALL')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        correctOptionFilter === 'ALL'
                          ? 'bg-indigo-600 text-white shadow'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Tất cả ({currentQuestions.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setCorrectOptionFilter('A')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        correctOptionFilter === 'A'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Đúng A ({countA})
                    </button>

                    <button
                      type="button"
                      onClick={() => setCorrectOptionFilter('B')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        correctOptionFilter === 'B'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Đúng B ({countB})
                    </button>

                    <button
                      type="button"
                      onClick={() => setCorrectOptionFilter('C')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        correctOptionFilter === 'C'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Đúng C ({countC})
                    </button>

                    <button
                      type="button"
                      onClick={() => setCorrectOptionFilter('D')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        correctOptionFilter === 'D'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Đúng D ({countD})
                    </button>

                    {countNeedsCheck > 0 && (
                      <button
                        type="button"
                        onClick={() => setCorrectOptionFilter('NEEDS_CHECK')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          correctOptionFilter === 'NEEDS_CHECK'
                            ? 'bg-amber-600 text-white shadow'
                            : 'bg-amber-950/60 text-amber-400 border border-amber-500/40 hover:bg-amber-900/40'
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        <span>Cần kiểm tra ({countNeedsCheck})</span>
                      </button>
                    )}
                  </div>

                  {/* Search Keyword */}
                  <div className="relative min-w-[220px]">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      placeholder="Tìm câu hỏi hoặc đáp án..."
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs outline-none focus:border-indigo-400"
                    />
                    {searchKeyword && (
                      <button
                        type="button"
                        onClick={() => setSearchKeyword('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* QUESTIONS LIST WITH 1-CLICK DIRECT EDITING */}
                <div className="space-y-3">
                  {filteredQuestions.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                      Không tìm thấy câu hỏi nào phù hợp với bộ lọc hiện tại.
                    </div>
                  ) : (
                    filteredQuestions.map((q) => {
                      const realIdx = currentQuestions.findIndex(item => item.id === q.id);
                      return (
                        <div
                          key={q.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            q.needsTeacherConfirmation
                              ? 'bg-amber-950/30 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-2 flex-1">
                              
                              {/* Meta row */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-indigo-400 font-mono">
                                  Câu {realIdx + 1}
                                </span>
                                {q.subject && (
                                  <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                                    {q.subject}
                                  </span>
                                )}
                                {q.needsTeacherConfirmation ? (
                                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    Chưa xác định đáp án đúng
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    Đáp án đúng: {q.correctOption}
                                  </span>
                                )}
                              </div>

                              {/* Question Content */}
                              <p className="text-sm font-medium text-slate-100">
                                {q.content}
                              </p>

                              {/* 4 Options with Direct 1-Click Correct Option Selector */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                                  const isCorrect = q.correctOption === opt;
                                  return (
                                    <div
                                      key={opt}
                                      onClick={() => handleQuickChangeCorrectOption(q.id, opt)}
                                      className={`p-2.5 rounded-xl border text-xs flex items-start gap-2 cursor-pointer transition-all ${
                                        isCorrect
                                          ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200 font-semibold shadow-sm'
                                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-900'
                                      }`}
                                    >
                                      <div
                                        className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold ${
                                          isCorrect
                                            ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                            : 'border-slate-700 bg-slate-800 text-slate-400'
                                        }`}
                                      >
                                        {isCorrect ? <Check className="w-3 h-3 stroke-[3]" /> : opt}
                                      </div>
                                      <div className="flex-1 break-words">
                                        <span className={isCorrect ? 'text-emerald-300 font-bold' : 'text-slate-400'}>
                                          {opt}.{' '}
                                        </span>
                                        <span>{q.options[opt]}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Explanation if any */}
                              {q.explanation && (
                                <p className="text-[11px] text-slate-400 italic pt-1">
                                  💡 Giải thích: {q.explanation}
                                </p>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                title="Di chuyển lên"
                                disabled={realIdx === 0}
                                onClick={() => handleMoveQuestion(realIdx, 'up')}
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30 cursor-pointer"
                              >
                                <MoveUp className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                title="Di chuyển xuống"
                                disabled={realIdx === currentQuestions.length - 1}
                                onClick={() => handleMoveQuestion(realIdx, 'down')}
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30 cursor-pointer"
                              >
                                <MoveDown className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                title="Chỉnh sửa câu hỏi & các phương án"
                                onClick={() => setEditingQuestion(q)}
                                className="p-1.5 text-indigo-400 hover:bg-indigo-950/80 rounded-lg cursor-pointer"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                title="Xóa câu hỏi"
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="p-1.5 text-rose-400 hover:bg-rose-950/80 rounded-lg cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: TRANH BÍ ẨN (LƯỚI 4X2) */}
          {activeTab === 'puzzle' && (
            <div className="space-y-6">
              {/* Preset Jigsaw Themes */}
              <div className="bg-[#0b1329] border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Bộ sưu tập Tranh mẫu Jigsaw (8 mảnh)</span>
                  </h3>
                  <span className="text-[11px] text-amber-300">Nhấn để áp dụng</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {PUZZLE_THEMES.map((theme) => (
                    <div
                      key={theme.id}
                      onClick={() => {
                        audioManager.playClick();
                        const updated = pieces.map((p, idx) => ({
                          ...p,
                          label: theme.pieceLabels[idx] || p.label,
                          imageUrl: theme.imageUrl
                        }));
                        setPieces(updated);
                      }}
                      className="group p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 transition-all cursor-pointer flex flex-col space-y-2 hover:scale-[1.02]"
                    >
                      <div className="aspect-[16/10] w-full rounded-lg overflow-hidden border border-slate-800 bg-black">
                        <img
                          src={theme.imageUrl}
                          alt={theme.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200 group-hover:text-amber-300 truncate">
                          {theme.title}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {theme.artistOrTopic}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full Image Splitter */}
              <div className="bg-gradient-to-r from-amber-950/40 via-slate-950 to-indigo-950/40 border border-amber-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>Tải lên Bức ảnh riêng của Thầy/Cô (Tự động chia 8 mảnh Jigsaw)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Hỗ trợ định dạng PNG, JPG, JPEG, WEBP. Ảnh sẽ được tự động chia đều làm 8 mảnh ghép cho trò chơi.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={fullImageSliceRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFullImageSlice}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fullImageSliceRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all shrink-0"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Tải ảnh hoàn chỉnh & Tự cắt</span>
                  </button>
                </div>
              </div>

              {/* Individual Pieces View */}
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  Xem trước và thay đổi từng mảnh ghép riêng biệt:
                </p>

                <input
                  ref={singleImageInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleSinglePieceUpload}
                  className="hidden"
                />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {pieces.map((p) => (
                    <div
                      key={p.position}
                      className="bg-[#0b1329] border border-slate-800 rounded-2xl p-3 flex flex-col items-center text-center space-y-2 group"
                    >
                      <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
                        <img
                          src={p.imageUrl}
                          alt={p.label}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-slate-950/80 text-[10px] font-mono text-indigo-300">
                          #{p.position}
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-slate-300 truncate w-full">
                        {p.label}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setReplacingPieceId(p.position);
                          singleImageInputRef.current?.click();
                        }}
                        className="w-full py-1.5 bg-slate-800 hover:bg-indigo-950 text-slate-300 hover:text-indigo-300 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer border border-slate-700"
                      >
                        Thay ảnh mảnh #{p.position}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CÀI ĐẶT THỜI GIAN & ĐIỂM NGƯỠNG */}
          {activeTab === 'rules' && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-[#0b1329] border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">
                        Thời gian mỗi thử thách khuôn mặt
                      </h3>
                      <p className="text-xs text-slate-400">
                        Người chơi có khoảng thời gian này để thực hiện đúng biểu cảm
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-black text-amber-400 font-mono px-3 py-1 bg-amber-500/10 rounded-xl border border-amber-500/30">
                    {settings.timerSeconds} Giây
                  </span>
                </div>

                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={settings.timerSeconds}
                  onChange={(e) => setSettings({ ...settings, timerSeconds: Number(e.target.value) })}
                  className="w-full accent-amber-400 cursor-pointer"
                />

                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>5 giây (Thử thách nhanh)</span>
                  <span>10 giây (Tiêu chuẩn đề xuất)</span>
                  <span>30 giây (Thoải mái)</span>
                </div>
              </div>

              {/* Pass Threshold */}
              <div className="bg-[#0b1329] border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Gauge className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">
                        Ngưỡng điểm nhận diện tối thiểu để vượt qua
                      </h3>
                      <p className="text-xs text-slate-400">
                        Độ chính xác nhận diện khuôn mặt cần đạt trước khi tính điểm
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-black text-cyan-400 font-mono px-3 py-1 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
                    {settings.passThreshold}%
                  </span>
                </div>

                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={settings.passThreshold}
                  onChange={(e) => setSettings({ ...settings, passThreshold: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />

                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>50% (Dễ)</span>
                  <span>65% (Chuẩn tiểu học)</span>
                  <span>95% (Rất chuẩn xác)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 12 THỬ THÁCH AI */}
          {activeTab === 'challenges' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm text-slate-300">
                  Chọn các thử thách khuôn mặt được phép xuất hiện trong trò chơi ({settings.enabledChallenges.length}/{CHALLENGE_LIBRARY.length} đã bật):
                </p>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, enabledChallenges: CHALLENGE_LIBRARY.map(c => c.id) })}
                  className="text-xs text-indigo-400 hover:underline cursor-pointer font-bold"
                >
                  Bật tất cả
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {CHALLENGE_LIBRARY.map(c => {
                  const isEnabled = settings.enabledChallenges.includes(c.id);
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleToggleChallenge(c.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 select-none ${
                        isEnabled
                          ? 'bg-[#0b1329] border-indigo-500/80 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                          : 'bg-slate-950/40 border-slate-800 opacity-60'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                          isEnabled
                            ? 'bg-indigo-500 border-indigo-400 text-white'
                            : 'border-slate-700 bg-slate-900'
                        }`}
                      >
                        {isEnabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-100">
                          {c.name}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {c.shortDesc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: GIẤY KHEN & THÔNG TIN TRƯỜNG */}
          {activeTab === 'school' && (
            <div className="space-y-6 max-w-xl">
              <div className="bg-[#0b1329] border border-slate-800 rounded-2xl p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tên trường học / Đơn vị tổ chức:
                  </label>
                  <input
                    type="text"
                    value={settings.schoolName}
                    onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
                    placeholder="Ví dụ: Trường Tiểu học STEM Tân Tiến"
                    className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm outline-none focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tên giáo viên / Người ký xác nhận chuyên môn:
                  </label>
                  <input
                    type="text"
                    value={settings.teacherName}
                    onChange={(e) => setSettings({ ...settings, teacherName: e.target.value })}
                    placeholder="Ví dụ: Cô Nguyễn Mai Lan - Giáo viên chủ nhiệm"
                    className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              {/* Reset to Factory Defaults */}
              <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-950/20 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-rose-300">
                    Khôi phục cài đặt gốc của trò chơi
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Đặt lại toàn bộ kho 4 bộ câu hỏi, 8 mảnh ghép và cấu hình ban đầu
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm('Bạn có chắc chắn muốn khôi phục về dữ liệu mặc định ban đầu không?')) {
                      await onResetDefaults();
                      onClose();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Khôi phục gốc</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODAL 1: QUESTION INLINE / FULL EDITOR */}
      {editingQuestion && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-xl bg-slate-900 border-2 border-indigo-500/60 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">
                Chỉnh sửa Câu hỏi & Đáp án
              </h3>
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nội dung câu hỏi:
                </label>
                <textarea
                  rows={3}
                  value={editingQuestion.content}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, content: e.target.value })}
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm outline-none focus:border-indigo-400"
                />
              </div>

              {/* Options A, B, C, D */}
              <div className="grid grid-cols-2 gap-3">
                {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                  <div key={opt}>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Phương án {opt}:
                    </label>
                    <input
                      type="text"
                      value={editingQuestion.options[opt]}
                      onChange={(e) =>
                        setEditingQuestion({
                          ...editingQuestion,
                          options: { ...editingQuestion.options, [opt]: e.target.value }
                        })
                      }
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs outline-none focus:border-indigo-400"
                    />
                  </div>
                ))}
              </div>

              {/* Correct Option selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Chọn đáp án chính xác:
                </label>
                <div className="flex gap-3">
                  {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        setEditingQuestion({
                          ...editingQuestion,
                          correctOption: opt,
                          needsTeacherConfirmation: false
                        })
                      }
                      className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                        editingQuestion.correctOption === opt
                          ? 'bg-emerald-500 text-slate-950 shadow-md ring-2 ring-emerald-400'
                          : 'bg-slate-950 text-slate-400 border border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lĩnh vực / Môn học */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Lĩnh vực / Môn học:
                </label>
                <input
                  type="text"
                  value={editingQuestion.subject || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, subject: e.target.value })}
                  placeholder="Ví dụ: Tin học Lớp 3, STEM Vũ trụ..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-300 text-xs outline-none focus:border-indigo-400"
                />
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Giải thích đáp án đúng (hiển thị khi người chơi trả lời):
                </label>
                <input
                  type="text"
                  value={editingQuestion.explanation || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  placeholder="Ví dụ: Vì sao đáp án này đúng..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-300 text-xs outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentQuestions(prev =>
                    prev.map(q => (q.id === editingQuestion.id ? editingQuestion : q))
                  );
                  setEditingQuestion(null);
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Lưu câu hỏi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT QUESTION SET METADATA (TÊN BỘ, KHỐI LỚP, LĨNH VỰC) */}
      {editingSetMetadata && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-indigo-500/50 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">
                Sửa thông tin Bộ câu hỏi
              </h3>
              <button
                type="button"
                onClick={() => setEditingSetMetadata(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tên bộ câu hỏi:
                </label>
                <input
                  type="text"
                  value={editingSetMetadata.title}
                  onChange={(e) => setEditingSetMetadata({ ...editingSetMetadata, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Khối lớp / Phân loại:
                </label>
                <input
                  type="text"
                  value={editingSetMetadata.gradeBadge}
                  onChange={(e) => setEditingSetMetadata({ ...editingSetMetadata, gradeBadge: e.target.value })}
                  placeholder="Ví dụ: Lớp 3, Lớp 4, Lớp 5, STEM..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lĩnh vực bộ câu hỏi:
                </label>
                <input
                  type="text"
                  value={editingSetMetadata.category}
                  onChange={(e) => setEditingSetMetadata({ ...editingSetMetadata, category: e.target.value })}
                  placeholder="Ví dụ: Tin học & Máy tính, An toàn Internet, STEM..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs outline-none focus:border-indigo-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="set-saved-checkbox"
                  checked={editingSetMetadata.isSaved}
                  onChange={(e) => setEditingSetMetadata({ ...editingSetMetadata, isSaved: e.target.checked })}
                  className="w-4 h-4 accent-indigo-500"
                />
                <label htmlFor="set-saved-checkbox" className="text-xs text-slate-300 cursor-pointer">
                  Lưu bộ câu hỏi này vào Kho hệ thống lâu dài
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingSetMetadata(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveSetMetadata}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Lưu thông tin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE / SAVE NEW QUESTION SET */}
      {newSetFromImport.open && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-indigo-500/50 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-indigo-400" />
                <span>Lưu Bộ Câu Hỏi Mới Vào Kho</span>
              </h3>
              <button
                type="button"
                onClick={() => setNewSetFromImport(prev => ({ ...prev, open: false }))}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tên bộ câu hỏi:
                </label>
                <input
                  type="text"
                  value={newSetFromImport.title}
                  onChange={(e) => setNewSetFromImport(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ví dụ: Tin học Lớp 3 - Ôn tập học kỳ"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Khối lớp / Phân loại:
                </label>
                <input
                  type="text"
                  value={newSetFromImport.gradeBadge}
                  onChange={(e) => setNewSetFromImport(prev => ({ ...prev, gradeBadge: e.target.value }))}
                  placeholder="Ví dụ: Lớp 3, Lớp 4, Lớp 5, STEM..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lĩnh vực:
                </label>
                <input
                  type="text"
                  value={newSetFromImport.category}
                  onChange={(e) => setNewSetFromImport(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Ví dụ: Tin học & Máy tính, STEM..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs outline-none focus:border-indigo-400"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
                <span>Số câu hỏi sẽ nhập: </span>
                <strong className="text-indigo-400 font-bold">{newSetFromImport.questions.length} câu</strong>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="new-set-saved"
                  checked={newSetFromImport.isSaved}
                  onChange={(e) => setNewSetFromImport(prev => ({ ...prev, isSaved: e.target.checked }))}
                  className="w-4 h-4 accent-indigo-500"
                />
                <label htmlFor="new-set-saved" className="text-xs text-slate-300 cursor-pointer">
                  Lưu bộ này vào Kho bộ câu hỏi lâu dài
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setNewSetFromImport(prev => ({ ...prev, open: false }))}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmCreateSet}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Lưu và Chọn ngay
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
