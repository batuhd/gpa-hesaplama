import { useState, useMemo } from 'react';
import { calculateCourse, getLetterFromScore } from '../utils/grades';

const TARGETS = [
  { key: 'aa', label: 'AA', min: 90 },
  { key: 'ba', label: 'BA', min: 80 },
  { key: 'bb', label: 'BB', min: 70 },
  { key: 'cb', label: 'CB', min: 60 },
  { key: 'cc', label: 'CC', min: 55 },
  { key: 'dc', label: 'DC', min: 50 },
  { key: 'dd', label: 'DD', min: 45 },
];

export default function Hesaplayicilar({ courses }) {
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [scenarioScores, setScenarioScores] = useState({});

  const selectedCourse = useMemo(() => courses.find((c) => String(c.id) === selectedCourseId), [courses, selectedCourseId]);

  const currentResult = useMemo(() => {
    if (!selectedCourse) return null;
    return calculateCourse(selectedCourse);
  }, [selectedCourse]);

  // Final target calculator
  const finalExam = useMemo(() => {
    if (!selectedCourse) return null;
    return selectedCourse.exams.find((e) => e.type === 'final');
  }, [selectedCourse]);

  const preFinal = useMemo(() => {
    if (!selectedCourse || !finalExam) return 0;
    let sum = 0;
    let wSum = 0;
    selectedCourse.exams.forEach((e) => {
      if (e.type !== 'final' && e.score !== null && e.score !== undefined && e.score !== '') {
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
        <h2 className="text-base font-bold text-[#333] mb-4">Hesaplayıcılar</h2>
        <div className="max-w-md">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Ders Seçiniz</label>
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              setScenarioScores({});
            }}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
          >
            <option value="">-- Ders Seçiniz --</option>
            {courses.map((c) => (
              <option key={c.id} value={String(c.id)}>{c.code} - {c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedCourse && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gereken Final */}
          <div className="bg-white border border-[#dee2e6] rounded-md p-5">
            <h3 className="text-sm font-bold text-[#333] mb-3">Gereken Final Notu Hesaplayıcı</h3>
            <p className="text-xs text-gray-500 mb-4">
              Mevcut sınav ortalamanız: <strong>{preFinal.toFixed(2)}</strong> (Final ağırlığı: {finalWeight}%)
            </p>

            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#fafbfc]">
                  <th className="border border-[#dee2e6] px-3 py-2 text-left">Harf Notu</th>
                  <th className="border border-[#dee2e6] px-3 py-2">Katsayı</th>
                  <th className="border border-[#dee2e6] px-3 py-2">Gereken Ort.</th>
                  <th className="border border-[#dee2e6] px-3 py-2">Alınması Gereken Final</th>
                </tr>
              </thead>
              <tbody>
                {TARGETS.map((t) => {
                  const needed = computeNeeded(t.min);
                  const coefMap = { AA: 4.0, BA: 3.5, BB: 3.0, CB: 2.5, CC: 2.0, DC: 1.5, DD: 1.0 };
                  const colorCls = needed?.color === 'red' ? 'text-red-600' : needed?.color === 'green' ? 'text-green-600' : needed?.color === 'orange' ? 'text-amber-600' : 'text-[#0056b3]';
                  return (
                    <tr key={t.key}>
                      <td className="border border-[#dee2e6] px-3 py-2 font-semibold">{t.label}</td>
                      <td className="border border-[#dee2e6] px-3 py-2 text-center">{coefMap[t.label]}</td>
                      <td className="border border-[#dee2e6] px-3 py-2 text-center">{t.min}</td>
                      <td className={`border border-[#dee2e6] px-3 py-2 text-center font-bold ${colorCls}`}>
                        {needed ? needed.val : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Senaryo */}
          <div className="bg-white border border-[#dee2e6] rounded-md p-5">
            <h3 className="text-sm font-bold text-[#333] mb-3">Senaryo Hesaplayıcı (Not Değişim Aracı)</h3>
            <p className="text-xs text-gray-500 mb-4">"Ödevden 10 puan fazla alırsam harf notum ne olur?"</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {selectedCourse.exams.map((e) => (
                <div key={e.id}>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">{e.name} (%{e.weight})</label>
                  <input
                    type="number"
                    defaultValue={e.score ?? ''}
                    onChange={(ev) => handleScenarioChange(e.id, ev.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                  />
                </div>
              ))}
            </div>

            <div className="bg-[#e9ecef] border-l-4 border-[#0056b3] rounded p-3 text-sm">
              <div className="flex justify-between mb-1">
                <span className="font-semibold">Mevcut Durum:</span>
                <span>{currentResult ? `${currentResult.average} (${currentResult.letter || '—'})` : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Yeni Durum:</span>
                <span className={`font-bold ${scenarioResult?.isThresholdFail ? 'text-red-600' : 'text-[#0056b3]'}`}>
                  {scenarioResult ? `${scenarioResult.average} (${scenarioResult.letter || '—'})` : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
