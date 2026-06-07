import { useState, useEffect } from 'react';

const emptyExam = () => ({
  id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
  name: '',
  type: 'other',
  weight: 0,
  score: null,
});

const defaultCourse = () => ({
  id: null,
  code: '',
  name: '',
  credit: 3,
  ects: 5,
  finalThreshold: 0,
  overrideActive: false,
  overrideLetter: 'FF',
  term: 'Bahar',
  year: '2025-2026',
  exams: [emptyExam(), emptyExam()],
});

export default function DersModal({ isOpen, onClose, onSave, onDelete, editingCourse }) {
  const [form, setForm] = useState(defaultCourse());
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingCourse) {
      setForm({ ...editingCourse });
    } else {
      setForm(defaultCourse());
    }
    setError('');
  }, [editingCourse, isOpen]);

  if (!isOpen) return null;

  const totalWeight = form.exams.reduce((sum, e) => sum + (Number(e.weight) || 0), 0);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleExamChange = (id, field, value) => {
    setForm((prev) => ({
      ...prev,
      exams: prev.exams.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
    setError('');
  };

  const addExam = () => {
    setForm((prev) => ({
      ...prev,
      exams: [...prev.exams, emptyExam()],
    }));
  };

  const removeExam = (id) => {
    setForm((prev) => ({
      ...prev,
      exams: prev.exams.filter((e) => e.id !== id),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) {
      setError('Ders kodu ve adı zorunludur.');
      return;
    }
    if (totalWeight !== 100) {
      setError(`Sınav ağırlıklarının toplamı 100 olmalıdır. Şu an: ${totalWeight}`);
      return;
    }
    if (form.exams.some((ex) => !ex.name.trim())) {
      setError('Tüm sınavların bir adı olmalıdır.');
      return;
    }
    onSave({
      ...form,
      id: form.id || Date.now(),
      code: form.code.toUpperCase(),
      name: form.name.toUpperCase(),
      credit: Number(form.credit) || 0,
      ects: Number(form.ects) || 0,
      finalThreshold: Number(form.finalThreshold) || 0,
      overrideActive: !!form.overrideActive,
      overrideLetter: form.overrideLetter || 'FF',
      exams: form.exams.map((e) => ({
        ...e,
        weight: Number(e.weight) || 0,
        score: e.score === '' || e.score === null ? null : Number(e.score),
      })),
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Bu dersi silmek istediğinize emin misiniz?')) {
      onDelete(form.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 pt-10 lg:pt-20 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 mb-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#dee2e6]">
          <h2 className="text-base font-bold text-[#333]">
            {form.id ? 'Dersi Düzenle' : 'Yeni Ders Ekle'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Ders Kodu</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => handleChange('code', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="Örn: YBS110"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Ders Adı</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="Örn: R VE PYTHON PROGRAMLAMA"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Kredi</label>
              <input
                type="number"
                step="0.5"
                value={form.credit}
                onChange={(e) => handleChange('credit', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">AKTS</label>
              <input
                type="number"
                step="0.5"
                value={form.ects}
                onChange={(e) => handleChange('ects', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Dönem</label>
              <select
                value={form.term}
                onChange={(e) => handleChange('term', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
              >
                <option>Güz</option>
                <option>Bahar</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Eğitim Yılı</label>
              <input
                type="text"
                value={form.year}
                onChange={(e) => handleChange('year', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Final Barajı (Geçme Notu)</label>
              <input
                type="number"
                value={form.finalThreshold}
                onChange={(e) => handleChange('finalThreshold', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="Yoksa 0 bırakın"
              />
              <p className="text-[11px] text-gray-400 mt-0.5">Final notu bu değerin altındaysa otomatik FF.</p>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={!!form.overrideActive}
                  onChange={(e) => handleChange('overrideActive', e.target.checked)}
                  className="accent-[#0056b3]"
                />
                Harf notunu kendim belirle
              </label>
              {form.overrideActive && (
                <select
                  value={form.overrideLetter || 'FF'}
                  onChange={(e) => handleChange('overrideLetter', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                >
                  <option value="AA">AA</option>
                  <option value="BA">BA</option>
                  <option value="BB">BB</option>
                  <option value="CB">CB</option>
                  <option value="CC">CC</option>
                  <option value="DC">DC</option>
                  <option value="DD">DD</option>
                  <option value="FF">FF</option>
                </select>
              )}
              <p className="text-[11px] text-gray-400 mt-0.5">İşaretlerseniz hesaplanan not yerine seçtiğiniz not kullanılır.</p>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-[#333]">Sınavlar ve Ağırlıklar</p>
              <span className={`text-xs font-medium ${totalWeight === 100 ? 'text-green-600' : 'text-red-500'}`}>
                Toplam Ağırlık: {totalWeight}%
              </span>
            </div>

            <div className="space-y-2">
              {form.exams.map((exam, idx) => (
                <div key={exam.id} className="grid grid-cols-12 gap-2 items-center bg-[#f8f9fa] rounded p-2">
                  <div className="col-span-4">
                    <input
                      type="text"
                      placeholder="Sınav adı"
                      value={exam.name}
                      onChange={(e) => handleExamChange(exam.id, 'name', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div className="col-span-3">
                    <select
                      value={exam.type}
                      onChange={(e) => handleExamChange(exam.id, 'type', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white"
                    >
                      <option value="other">Yıl İçi</option>
                      <option value="final">Final/Bütünleme</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Ağırlık %"
                      value={exam.weight}
                      onChange={(e) => handleExamChange(exam.id, 'weight', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Not"
                      value={exam.score === null ? '' : exam.score}
                      onChange={(e) => handleExamChange(exam.id, 'score', e.target.value === '' ? null : e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeExam(exam.id)}
                      className="text-red-500 hover:text-red-700 text-lg leading-none"
                      title="Sil"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addExam}
              className="mt-2 text-sm text-[#0056b3] hover:underline font-medium"
            >
              + Yeni Sınav Ekle
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-[#0056b3] text-white text-sm font-medium py-2 rounded hover:bg-[#004494] transition"
            >
              Kaydet
            </button>
            {form.id && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 bg-red-50 text-red-600 border border-red-200 text-sm font-medium py-2 rounded hover:bg-red-100 transition"
              >
                Sil
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 bg-gray-100 text-gray-700 text-sm font-medium py-2 rounded hover:bg-gray-200 transition"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
