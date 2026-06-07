import { useState, useMemo } from 'react';
import { resolveCourseGrade } from '../utils/grades';
import Hesaplayicilar from './Hesaplayicilar';

export default function DersTablosu({ courses, onEdit, onAdd, onPaste }) {
  const [selectedTerm, setSelectedTerm] = useState('Tümü');

  const groupedTerms = useMemo(() => {
    const map = {};
    courses.forEach((c) => {
      if (!map[c.year]) map[c.year] = new Set();
      map[c.year].add(c.term);
    });
    const sortedYears = Object.keys(map).sort();
    const result = {};
    sortedYears.forEach((year) => {
      result[year] = Array.from(map[year]).sort();
    });
    return result;
  }, [courses]);

  const filtered = useMemo(() => {
    if (selectedTerm === 'Tümü') return courses;
    return courses.filter((c) => `${c.year} ${c.term}` === selectedTerm);
  }, [courses, selectedTerm]);

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#dee2e6] rounded-md p-4">
        <h2 className="text-base font-bold text-[#333]">Sınav Sonuçları</h2>
        <div className="flex items-center gap-3">
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
          >
            <option value="Tümü">Tümü</option>
            {Object.entries(groupedTerms).map(([year, terms]) => (
              <optgroup key={year} label={year}>
                {terms.map((term) => (
                  <option key={`${year} ${term}`} value={`${year} ${term}`}>
                    {term}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <button
            onClick={onPaste}
            className="bg-white border border-gray-300 text-[#333] text-sm font-medium px-4 py-1.5 rounded hover:bg-[#f1f5f9] transition whitespace-nowrap"
          >
            Sayfadan Yapıştır
          </button>
          <button
            onClick={onAdd}
            className="bg-white border border-gray-300 text-[#333] text-sm font-medium px-4 py-1.5 rounded hover:bg-[#f1f5f9] transition whitespace-nowrap"
          >
            + Ders Ekle
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white border border-[#dee2e6] rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="portal-table w-full border-collapse min-w-[700px]">
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
                const result = resolveCourseGrade(c);
                const activeExams = c.exams.filter((e) => (e.weight || 0) > 0);
                const rowSpan = Math.max(activeExams.length, 1);

                return activeExams.map((exam, idx) => {
                  const status = exam.score !== null && exam.score !== undefined && exam.score !== '' ? 'İlan Edildi' : 'İlan Edilmedi';
                  const displayScore = exam.score !== null && exam.score !== undefined && exam.score !== '' ? Number(exam.score).toFixed(2) : '';
                  const label = `${exam.name} / %${exam.weight}`;

                  return (
                    <tr key={`${c.id}-${exam.id}`} className={idx === 0 ? 'cursor-pointer hover:bg-[#f1f8ff]' : ''} onClick={() => idx === 0 && onEdit(c)}>
                      {idx === 0 && (
                        <>
                          <td rowSpan={rowSpan} className="text-left pl-4 text-[#0056b3] font-medium">{c.code}</td>
                          <td rowSpan={rowSpan} className="text-left">
                            <div className="max-w-[180px] truncate" title={c.name}>{c.name}</div>
                            <small className="text-gray-400">Baraj: {c.finalThreshold || 'Yok'}</small>
                          </td>
                          <td rowSpan={rowSpan}>{Number(c.credit).toFixed(2)}</td>
                          <td rowSpan={rowSpan}>{Number(c.ects).toFixed(2)}</td>
                          <td rowSpan={rowSpan}>
                            {result.isThresholdFail ? (
                              <span className="text-red-600 font-bold" title="Final barajını geçemediğiniz için FF">FF (Baraj)</span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <strong>{result.letter || '—'}</strong>
                                {result.isOverride && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700" title="Harf notu manuel olarak belirlendi">Manuel</span>
                                )}
                              </div>
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

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white border border-[#dee2e6] rounded-md p-8 text-center text-gray-400 text-sm">
            Henüz ders eklenmemiş.
          </div>
        )}
        {filtered.map((c) => {
          const result = resolveCourseGrade(c);
          const activeExams = c.exams.filter((e) => (e.weight || 0) > 0);

          return (
            <div key={c.id} className="bg-white border border-[#dee2e6] rounded-md overflow-hidden">
              <div className="p-4 cursor-pointer hover:bg-[#f1f8ff] transition" onClick={() => onEdit(c)}>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-[#0056b3] font-medium text-sm truncate">{c.code}</div>
                    <div className="font-semibold text-[#333] text-base leading-tight mt-0.5 break-words">{c.name}</div>
                    <div className="text-xs text-gray-400 mt-1">Baraj: {c.finalThreshold || 'Yok'}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-[#333]">
                      {result.isThresholdFail ? (
                        <span className="text-red-600" title="Final barajını geçemediğiniz için FF">FF</span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span>{result.letter || '—'}</span>
                          {result.isOverride && (
                            <span className="inline-flex items-center px-1 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700" title="Harf notu manuel olarak belirlendi">M</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">{Number(c.credit).toFixed(2)} Kredi</div>
                    <div className="text-xs text-gray-400">{Number(c.ects).toFixed(2)} AKTS</div>
                  </div>
                </div>
              </div>

              {/* Exams list inside card */}
              <div className="border-t border-[#dee2e6]">
                {activeExams.map((exam) => {
                  const status = exam.score !== null && exam.score !== undefined && exam.score !== '' ? 'İlan Edildi' : 'İlan Edilmedi';
                  const displayScore = exam.score !== null && exam.score !== undefined && exam.score !== '' ? Number(exam.score).toFixed(2) : '-';
                  return (
                    <div key={exam.id} className="flex items-center justify-between px-4 py-2.5 text-sm border-b border-[#f1f5f9] last:border-b-0">
                      <div>
                        <span className="font-medium text-[#333]">{exam.name}</span>
                        <span className="text-gray-400 ml-2">% {exam.weight}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-[#333]">{displayScore}</div>
                        <div className="text-[11px] text-gray-400">{status}</div>
                      </div>
                    </div>
                  );
                })}
                {activeExams.length === 0 && (
                  <div className="px-4 py-3 text-xs text-gray-400">Sınav tanımlanmamış.</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Warning */}
      <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded text-sm leading-relaxed">
        <p className="font-semibold mb-1">Bilgilendirme</p>
        <p>Okulunuz <strong>bağıl değerlendirme</strong> (curved grading) sistemini kullanmaktadır. Sınıf ortalaması ve standart sapması bilinmediğinden, bu hesaplayıcı sadece <strong>mutlak puan aralıklarına</strong> göre harf notu üretir. 20+ kişilik derslerde okulunuzun resmi notu ile farklılık gösterebilir. Final barajını da elle girmeyi unutmayın.</p>
      </div>

      {/* Legend */}
      <div className="text-[11px] text-gray-500 leading-relaxed">
        <p><strong>Notlar ve Katsayılar;</strong> AA:4.0, BA:3.5, BB: 3, CB:2.5, CC:2 , DC:1.5, DD:1, FF:0, EX:-, F:0 , I:0, NA:0, W:0 , M:-, S:-, U:-, P:-, NI:0.</p>
        <p><strong>Kısaltmalar;</strong> Z: Zorunlu, P:Program Seçmeli, F:Fakülte Seçmeli, U:Üniversite Seçmeli, Y:Ortalamaya Katılmaz, R:Tekrar, T: Transfer, D-:Seçilen Ders, I:Eksik Not, S:Yeterli Not, U:Yetersiz Not, EX:Muaf Not, M:Muaf Not, W:Çekilmiş Not, NI:Program Dışı Not, P:Başarıyla Sürdürmekte Olan, NA:Devamsızlıktan Başarısız</p>
      </div>

      {/* Hesaplayıcılar */}
      <Hesaplayicilar courses={courses} />
    </div>
  );
}
