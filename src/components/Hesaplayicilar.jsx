import { useState, useMemo } from 'react';
import { calculateCourse, resolveCourseGrade, getLetterFromScore } from '../utils/grades';

const TARGETS = [
  { key: 'aa', label: 'AA', min: 90 },
  { key: 'ba', label: 'BA', min: 79 },
  { key: 'bb', label: 'BB', min: 68 },
  { key: 'cb', label: 'CB', min: 61 },
  { key: 'cc', label: 'CC', min: 54 },
  { key: 'dc', label: 'DC', min: 47 },
  { key: 'dd', label: 'DD', min: 39 },
];

function findFinalExam(exams) {
  if (!exams || exams.length === 0) return null;
  // 1. Önce type === 'final' olanları ara
  let exam = exams.find((e) => e.type === 'final');
  if (exam) return exam;
  // 2. Yoksa isimde final/bütünleme/yılsonu geçenleri ara (case-insensitive)
  exam = exams.find((e) =>
    /final|bütünleme|bütunleme|yılsonu|yıl sonu|yilsonu|yil sonu/i.test(e.name)
  );
  if (exam) return exam;
  // 3. Hala yoksa en yüksek ağırlıklı olanı al
  return [...exams].sort((a, b) => Number(b.weight) - Number(a.weight))[0];
}

export default function Hesaplayicilar({ courses }) {
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [scenarioScores, setScenarioScores] = useState({});

  const selectedCourse = useMemo(() => courses.find((c) => String(c.id) === selectedCourseId), [courses, selectedCourseId]);

  const groupedCourses = useMemo(() => {
    const map = {};
    courses.forEach((c) => {
      const key = `${c.year} ${c.term}`;
      if (!map[key]) map[key] = [];
      map[key].push(c);
    });
    // Sort each group by course code
    Object.keys(map).forEach((key) => {
      map[key].sort((a, b) => a.code.localeCompare(b.code));
    });
    // Sort keys (terms) chronologically
    const sortedKeys = Object.keys(map).sort((a, b) => {
      const [yearA, termA] = a.split(' ');
      const [yearB, termB] = b.split(' ');
      if (yearA !== yearB) return yearB.localeCompare(yearA); // Newest year first
      return termA === 'Güz' ? -1 : 1; // Güz before Bahar
    });
    return { map, keys: sortedKeys };
  }, [courses]);

  const currentResult = useMemo(() => {
    if (!selectedCourse) return null;
    return resolveCourseGrade(selectedCourse);
  }, [selectedCourse]);

  // Final target calculator
  const finalExam = useMemo(() => {
    if (!selectedCourse) return null;
    return findFinalExam(selectedCourse.exams);
  }, [selectedCourse]);

  const preFinal = useMemo(() => {
    if (!selectedCourse || !finalExam) return 0;
    let sum = 0;
    let wSum = 0;
    selectedCourse.exams.forEach((e) => {
      // Final sınavı hariç diğerlerini hesapla (id ile karşılaştır)
      if (e.id !== finalExam.id && e.score !== null && e.score !== undefined && e.score !== '') {
        sum += Number(e.score) * (Number(e.weight) / 100);
        wSum += Number(e.weight);
      }
    });
    if (wSum === 0) return 0;
    return (sum / wSum) * 100;
  }, [selectedCourse, finalExam]);

  const finalWeight = finalExam ? Number(finalExam.weight) : 0;

  const computeNeeded = (targetMin) => {
    if (!selectedCourse || finalWeight === 0) return null;
    // total = preFinal * (1 - finalWeight/100) + final * (finalWeight/100)
    // targetMin = preFinal * ((100-finalWeight)/100) + final * (finalWeight/100)
    const vizeW = 100 - finalWeight;
    const needed = (targetMin - (preFinal * (vizeW / 100))) / (finalWeight / 100);
    const ceilNeeded = Math.ceil(needed);
    const threshold = Number(selectedCourse.finalThreshold) || 0;

    if (ceilNeeded > 100) return { val: 'İmkansız', color: 'red' };
    if (ceilNeeded <= 0) {
      if (threshold > 0) {
        return { val: `Baraj: ${threshold}`, color: 'orange', note: 'Ortalamanız yetiyor ama barajı geçmeniz şart' };
      }
      return { val: '0 Yeterli', color: 'green' };
    }
    if (threshold > 0 && ceilNeeded < threshold) {
      return { val: `${threshold} (Baraj)`, color: 'red' };
    }
    return { val: String(ceilNeeded), color: 'blue' };
  };

  // Scenario handler
  const handleScenarioChange = (examId, value) => {
    setScenarioScores((prev) => ({ ...prev, [examId]: value }));
  };

  const scenarioResult = useMemo(() => {
    if (!selectedCourse) return null;
    const tempExams = selectedCourse.exams.map((e) => {
      const sid = String(e.id);
      if (scenarioScores[sid] !== undefined) {
        return { ...e, score: scenarioScores[sid] === '' ? null : Number(scenarioScores[sid]) };
      }
      return e;
    });
    const tempCourse = { ...selectedCourse, exams: tempExams };
    return calculateCourse(tempCourse);
  }, [selectedCourse, scenarioScores]);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#dee2e6] rounded-md p-4">
        <h2 className="text-base font-bold text-[#333] mb-3">Hesaplayıcılar</h2>
        <div className="max-w-md">
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              setScenarioScores({});
            }}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white"
          >
            <option value="">Ders seçiniz...</option>
            {groupedCourses.keys.map((termKey) => (
              <optgroup key={termKey} label={termKey}>
                {groupedCourses.map[termKey].map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {selectedCourse && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gereken Final */}
          <div className="bg-white border border-[#dee2e6] rounded-md p-4">
            <h3 className="text-sm font-bold text-[#333] mb-2">Gereken Final Notu</h3>
            <p className="text-xs text-gray-500 mb-3">
              Ortalamanız: <strong>{preFinal.toFixed(2)}</strong> · Final: {finalWeight}%
            </p>

            <div className="space-y-1">
              {TARGETS.map((t) => {
                const needed = computeNeeded(t.min);
                const coefMap = { AA: 4.0, BA: 3.5, BB: 3.0, CB: 2.5, CC: 2.0, DC: 1.5, DD: 1.0 };
                const colorCls = needed?.color === 'red' ? 'text-red-600' : needed?.color === 'green' ? 'text-green-600' : needed?.color === 'orange' ? 'text-amber-600' : 'text-[#0056b3]';
                return (
                  <div key={t.key} className="flex items-center justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold w-8">{t.label}</span>
                      <span className="text-xs text-gray-400">({coefMap[t.label]})</span>
                    </div>
                    <span className={`font-bold ${colorCls}`}>
                      {needed ? needed.val : '-'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Senaryo */}
          <div className="bg-white border border-[#dee2e6] rounded-md p-4">
            <h3 className="text-sm font-bold text-[#333] mb-2">Senaryo</h3>
            <p className="text-xs text-gray-500 mb-3">Notları değiştirerek sonucu görün.</p>

            <div className="space-y-2 mb-3">
              {selectedCourse.exams.map((e) => (
                <div key={e.id} className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 w-24 truncate" title={e.name}>{e.name}</label>
                  <span className="text-xs text-gray-400">%{e.weight}</span>
                  <input
                    type="number"
                    defaultValue={e.score ?? ''}
                    onChange={(ev) => handleScenarioChange(e.id, ev.target.value)}
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
              <span className="text-gray-500">Mevcut:</span>
              <span>
                {currentResult ? (
                  <>
                    {currentResult.isOverride ? (
                      <span className="inline-flex items-center gap-1">
                        {currentResult.letter}
                        <span className="inline-flex items-center px-1 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700" title="Harf notu manuel olarak belirlendi">M</span>
                      </span>
                    ) : (
                      `${currentResult.average} (${currentResult.letter || '—'})`
                    )}
                  </>
                ) : '—'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Yeni:</span>
              <span className={`font-bold ${scenarioResult?.isThresholdFail ? 'text-red-600' : 'text-[#0056b3]'}`}>
                {scenarioResult ? `${scenarioResult.average} (${scenarioResult.letter || '—'})` : '—'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
