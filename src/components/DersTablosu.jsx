import { useState, useMemo } from 'react';
import { calculateCourse } from '../utils/grades';
import Hesaplayicilar from './Hesaplayicilar';

export default function DersTablosu({ courses, onEdit, onAdd }) {
  const [selectedTerm, setSelectedTerm] = useState('Tümü');

  const terms = useMemo(() => {
    const set = new Set(courses.map((c) => `${c.year} ${c.term}`));
    return ['Tümü', ...Array.from(set).sort()];
  }, [courses]);

  const filtered = useMemo(() => {
    if (selectedTerm === 'Tümü') return courses;
    return courses.filter((c) => `${c.year} ${c.term}` === selectedTerm);
  }, [courses, selectedTerm]);

  const handleRowClick = (c) => {
    onEdit(c);
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#dee2e6] rounded-md p-4">
        <h2 className="text-base font-bold text-[#333]">Sınav Sonuçları</h2>
        <div className="flex items-center gap-3">
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white"
          >
            {terms.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button
            onClick={onAdd}
            className="bg-white border border-gray-300 text-[#333] text-sm font-medium px-4 py-1.5 rounded hover:bg-[#f1f5f9] transition"
          >
            + Ders Ekle / Düzenle
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#dee2e6] rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="portal-table w-full border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="whitespace-nowrap">Ders Kodu</th>
                <th className="whitespace-nowrap">Ders Adı</th>
                <th className="whitespace-nowrap">Kredi</th>
                <th className="whitespace-nowrap">Akts</th>
                <th className="whitespace-nowrap">Harf Notu</th>
                <th className="whitespace-nowrap">Sınav Tipi</th>
                <th className="whitespace-nowrap">Sınav Notu</th>
                <th className="whitespace-nowrap">İlan Durumu</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-gray-400 text-sm">
                    Henüz ders eklenmemiş. "+ Ders Ekle" butonunu kullanın.
                  </td>
                </tr>
              )}
              {filtered.map((c) => {
                const result = calculateCourse(c);
                const activeExams = c.exams.filter((e) => (e.weight || 0) > 0);
                const rowSpan = Math.max(activeExams.length, 1);

                return activeExams.map((exam, idx) => {
                  const status = exam.score !== null && exam.score !== undefined && exam.score !== '' ? 'İlan Edildi' : 'İlan Edilmedi';
                  const displayScore = exam.score !== null && exam.score !== undefined && exam.score !== '' ? Number(exam.score).toFixed(2) : '';
                  const label = `${exam.name} / %${exam.weight}`;

                  return (
                    <tr key={`${c.id}-${exam.id}`} className={idx === 0 ? 'cursor-pointer hover:bg-[#f1f8ff]' : ''} onClick={() => idx === 0 && handleRowClick(c)}>
                      {idx === 0 && (
                        <>
                          <td rowSpan={rowSpan} className="text-left pl-4 text-[#0056b3] font-medium">{c.code}</td>
                          <td rowSpan={rowSpan} className="text-left">
                            {c.name}
                            <br />
                            <small className="text-gray-400">Baraj: {c.finalThreshold || 'Yok'}</small>
                          </td>
                          <td rowSpan={rowSpan}>{Number(c.credit).toFixed(2)}</td>
                          <td rowSpan={rowSpan}>{Number(c.ects).toFixed(2)}</td>
                          <td rowSpan={rowSpan}>
                            {result.isThresholdFail ? (
                              <span className="text-red-600 font-bold" title="Final barajını geçemediğiniz için FF">FF (Baraj)</span>
                            ) : (
                              <strong>{result.letter || '—'}</strong>
                            )}
                          </td>
                        </>
                      )}
                      <td className="text-left">{label}</td>
                      <td>{displayScore}</td>
                      <td>{status}</td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="text-[11px] text-gray-500 leading-relaxed">
        <p><strong>Notlar ve Katsayılar;</strong> AA:4.0, BA:3.5, BB:3.0, CB:2.5, CC:2.0, DC:1.5, DD:1.0, FF:0.0, EX:-, F:0, I:0, NA:0, W:0, M:-, S:-, U:-, P:-, NI:0.</p>
        <p><strong>Kısaltmalar;</strong> Z: Zorunlu, P:Program Seçmeli, F:Fakülte Seçmeli, U:Üniversite Seçmeli, Y:Ortalamaya Katılmaz, R:Tekrar, T: Transfer, D-:Seçilen Ders, I:Eksik Not, S:Yeterli Not, U:Yetersiz Not, EX:Muaf Not, M:Muaf Not, W:Çekilmiş Not, NI:Program Dışı Not, P:Başarıyla Sürdürmekte Olan, NA:Devamsızlıktan Başarısız</p>
      </div>

      {/* Hesaplayıcılar */}
      <Hesaplayicilar courses={courses} />
    </div>
  );
}
