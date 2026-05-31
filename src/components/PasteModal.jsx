import { useState } from 'react';
import { parseAltinbasText } from '../utils/altinbasParser';
import { calculateCourse } from '../utils/grades';

export default function PasteModal({ isOpen, onClose, currentCourses, onConfirm }) {
  const [text, setText] = useState('');
  const [year, setYear] = useState('2025-2026');
  const [term, setTerm] = useState('Bahar');
  const [step, setStep] = useState('paste'); // 'paste' | 'preview'
  const [parsed, setParsed] = useState({ courses: [], year: '', term: '' });
  const [mergeMode, setMergeMode] = useState('overwrite'); // 'overwrite' | 'duplicate'
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePreview = () => {
    setError('');
    if (!text.trim()) {
      setError('Lütfen bir metin yapıştırın.');
      return;
    }
    try {
      const result = parseAltinbasText(text, year, term);
      if (result.courses.length === 0) {
        setError(
          'Metinden ders bilgisi çıkarılamadı. Lütfen doğru formatta yapıştırdığınızdan emin olun.'
        );
        return;
      }
      setParsed(result);
      setStep('preview');
    } catch (err) {
      setError('Ayrıştırma hatası: ' + err.message);
    }
  };

  const handleBack = () => {
    setStep('paste');
    setParsed({ courses: [], year: '', term: '' });
    setError('');
  };

  const handleConfirm = () => {
    onConfirm(parsed.courses, mergeMode);
    // Reset state for next open
    setText('');
    setStep('paste');
    setParsed({ courses: [], year: '', term: '' });
    setError('');
    onClose();
  };

  // Detect conflicts with existing courses (same code + year + term)
  const conflicts = parsed.courses.filter((pc) =>
    currentCourses.some(
      (cc) => cc.code === pc.code && cc.year === pc.year && cc.term === pc.term
    )
  );
  const hasConflicts = conflicts.length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 pt-10 lg:pt-20 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 mb-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#dee2e6]">
          <h2 className="text-base font-bold text-[#333]">
            {step === 'paste'
              ? 'Üniversite Sayfasından İçe Aktar'
              : 'Önizleme'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}

          {step === 'paste' && (
            <>
              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded text-sm leading-relaxed">
                <p className="font-semibold mb-1">Nasıl kullanılır?</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Üniversitenizin Sınav Sonuçları sayfasına gidin.</li>
                  <li>Tüm sayfa içeriğini seçip kopyalayın (Ctrl+A, Ctrl+C).</li>
                  <li>Aşağıdaki kutuya yapıştırın (Ctrl+V).</li>
                  <li>"Önizle" butonuna tıklayın.</li>
                </ol>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Yapıştırılan Metin
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full h-56 border border-gray-300 rounded px-3 py-2 text-sm font-mono"
                  placeholder="Sayfadaki metni buraya yapıştırın..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Eğitim Yılı
                  </label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Dönem
                  </label>
                  <select
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                  >
                    <option>Güz</option>
                    <option>Bahar</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handlePreview}
                  className="flex-1 bg-[#0056b3] text-white text-sm font-medium py-2 rounded hover:bg-[#004494] transition"
                >
                  Önizle
                </button>
                <button
                  onClick={onClose}
                  className="px-4 bg-gray-100 text-gray-700 text-sm font-medium py-2 rounded hover:bg-gray-200 transition"
                >
                  İptal
                </button>
              </div>
            </>
          )}

          {step === 'preview' && (
            <>
              <p className="text-sm text-gray-600">
                <strong>{parsed.courses.length}</strong> ders bulundu.
                {parsed.year &&
                  parsed.term &&
                  ` (Otomatik tespit: ${parsed.year} ${parsed.term})`}
              </p>

              <div className="overflow-x-auto border border-gray-200 rounded">
                <table className="w-full text-sm border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700 font-semibold">
                      <th className="text-left px-3 py-2 border-b">Ders Kodu</th>
                      <th className="text-left px-3 py-2 border-b">Ders Adı</th>
                      <th className="px-3 py-2 border-b">Kredi</th>
                      <th className="px-3 py-2 border-b">AKTS</th>
                      <th className="text-left px-3 py-2 border-b">Sınavlar</th>
                      <th className="px-3 py-2 border-b">Üni. Notu</th>
                      <th className="px-3 py-2 border-b">Hesaplanan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.courses.map((c) => {
                      const res = calculateCourse(c);
                      return (
                        <tr
                          key={c.id}
                          className="hover:bg-gray-50 border-b last:border-b-0"
                        >
                          <td className="px-3 py-2 font-medium text-[#0056b3]">
                            {c.code}
                          </td>
                          <td className="px-3 py-2">{c.name}</td>
                          <td className="px-3 py-2 text-center">
                            {Number(c.credit).toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {Number(c.ects).toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-xs">
                            {c.exams.map((e) => (
                              <div key={e.id} className="whitespace-nowrap">
                                {e.name} (%{e.weight}):{' '}
                                {e.score !== null ? e.score : '—'}
                              </div>
                            ))}
                          </td>
                          <td className="px-3 py-2 text-center font-semibold">
                            {c.universityLetter || '—'}
                          </td>
                          <td className="px-3 py-2 text-center font-semibold">
                            {res.isThresholdFail ? (
                              <span className="text-red-600">FF (Baraj)</span>
                            ) : (
                              res.letter || '—'
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {hasConflicts && (
                <div className="bg-amber-50 border border-amber-200 rounded p-4 space-y-3">
                  <p className="text-sm text-amber-800 font-medium">
                    {conflicts.length} ders zaten mevcut listenizde bulunuyor.
                    Ne yapmak istersiniz?
                  </p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="radio"
                        name="mergeMode"
                        value="overwrite"
                        checked={mergeMode === 'overwrite'}
                        onChange={() => setMergeMode('overwrite')}
                        className="accent-[#0056b3]"
                      />
                      Mevcut dersleri güncelle (üzerine yaz)
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="radio"
                        name="mergeMode"
                        value="duplicate"
                        checked={mergeMode === 'duplicate'}
                        onChange={() => setMergeMode('duplicate')}
                        className="accent-[#0056b3]"
                      />
                      Yeni ders olarak ekle (çoğalt)
                    </label>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleConfirm}
                  className="flex-1 bg-[#0056b3] text-white text-sm font-medium py-2 rounded hover:bg-[#004494] transition"
                >
                  {hasConflicts
                    ? mergeMode === 'overwrite'
                      ? 'Güncelle ve Ekle'
                      : 'Tümünü Ekle'
                    : 'Ekle'}
                </button>
                <button
                  onClick={handleBack}
                  className="px-4 bg-gray-100 text-gray-700 text-sm font-medium py-2 rounded hover:bg-gray-200 transition"
                >
                  Geri Dön
                </button>
                <button
                  onClick={onClose}
                  className="px-4 bg-gray-100 text-gray-700 text-sm font-medium py-2 rounded hover:bg-gray-200 transition"
                >
                  İptal
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
