import { useMemo, useState } from 'react';
import { resolveCourseGrade, calculateGPA, GRADE_MAP, computeRequiredFinal, getLetterOptions } from '../utils/grades';

const INCOMPLETE = ['FF', 'F', 'I0', 'I', 'NA', 'W', 'NI'];

export default function Transkript({ courses }) {
  const [targetGPA, setTargetGPA] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [customTargets, setCustomTargets] = useState({});

  const grouped = useMemo(() => {
    const map = {};
    courses.forEach((c) => {
      const key = `${c.year} ${c.term}`;
      if (!map[key]) map[key] = [];
      map[key].push(c);
    });
    return map;
  }, [courses]);

  const keys = useMemo(() => Object.keys(grouped).sort(), [grouped]);
  const totalGPA = useMemo(() => calculateGPA(courses), [courses]);

  const computeTermStats = (list) => {
    let ectsTaken = 0;
    let ectsCompleted = 0;
    let totalPoints = 0;
    list.forEach((c) => {
      const res = resolveCourseGrade(c);
      ectsTaken += c.ects;
      if (!INCOMPLETE.includes(res.letter)) {
        ectsCompleted += c.ects;
      }
      const coef = GRADE_MAP[res.letter];
      if (coef !== undefined && coef !== null) {
        totalPoints += coef * c.ects;
      }
    });
    const gno = ectsTaken > 0 ? parseFloat((totalPoints / ectsTaken).toFixed(2)) : 0;
    return { ectsTaken, ectsCompleted, gno };
  };

  const flatCourses = useMemo(() => courses, [courses]);

  const getScenarioLetter = (c) => {
    if (selectedIds.has(c.id) && customTargets[c.id]) {
      return customTargets[c.id];
    }
    return resolveCourseGrade(c).letter;
  };

  const scenarioGPA = useMemo(() => {
    let totalPoints = 0;
    let totalEcts = 0;
    flatCourses.forEach((c) => {
      const letter = getScenarioLetter(c);
      const coef = GRADE_MAP[letter];
      if (coef !== null && coef !== undefined) {
        totalPoints += coef * c.ects;
        totalEcts += c.ects;
      }
    });
    if (totalEcts === 0) return 0;
    return parseFloat((totalPoints / totalEcts).toFixed(2));
  }, [flatCourses, selectedIds, customTargets]);

  const LETTER_ORDER = ['FF', 'DD', 'DC', 'CC', 'CB', 'BB', 'BA', 'AA'];

  // Upgrade the lowest-graded course first for balanced distribution
  const optimizeForTarget = (poolCourses, target) => {
    if (!target || isNaN(target) || target <= 0) {
      return { selectedIds: new Set(), customTargets: {} };
    }

    const currentGPA = calculateGPA(flatCourses);
    if (currentGPA >= target) {
      return { selectedIds: new Set(), customTargets: {} };
    }

    const totalEcts = flatCourses.reduce((sum, c) => sum + c.ects, 0);

    const scenario = {};
    flatCourses.forEach((c) => {
      scenario[c.id] = resolveCourseGrade(c).letter;
    });

    const selectedIds = new Set();
    const customTargets = {};

    while (true) {
      const points = flatCourses.reduce((sum, c) => {
        const coef = GRADE_MAP[scenario[c.id]];
        return sum + (coef !== null && coef !== undefined ? coef * c.ects : 0);
      }, 0);
      const gpa = parseFloat((points / totalEcts).toFixed(2));

      if (gpa >= target) break;

      // Find the course with the lowest current grade in the pool
      let minGradeIdx = Infinity;
      const candidates = [];
      for (const c of poolCourses) {
        const idx = LETTER_ORDER.indexOf(scenario[c.id]);
        if (idx === -1 || idx >= LETTER_ORDER.length - 1) continue;
        if (idx < minGradeIdx) {
          minGradeIdx = idx;
          candidates.length = 0;
          candidates.push(c);
        } else if (idx === minGradeIdx) {
          candidates.push(c);
        }
      }

      if (candidates.length === 0) break;

      // From courses with the same lowest grade, pick the one with the highest ECTS
      const bestCourse = candidates.sort((a, b) => b.ects - a.ects)[0];
      const bestLetter = LETTER_ORDER[minGradeIdx + 1];

      scenario[bestCourse.id] = bestLetter;
      selectedIds.add(bestCourse.id);
      customTargets[bestCourse.id] = bestLetter;
    }

    return { selectedIds, customTargets };
  };

  const handleSelectAll = () => {
    const target = parseFloat(targetGPA);
    if (target && !isNaN(target)) {
      const { selectedIds, customTargets } = optimizeForTarget(flatCourses, target);
      setSelectedIds(selectedIds);
      setCustomTargets(customTargets);
    } else {
      const all = new Set(flatCourses.map((c) => c.id));
      setSelectedIds(all);
      const targets = {};
      flatCourses.forEach((c) => {
        const current = resolveCourseGrade(c).letter;
        const idx = LETTER_ORDER.indexOf(current);
        targets[c.id] = idx >= 0 && idx < LETTER_ORDER.length - 1 ? LETTER_ORDER[idx + 1] : current;
      });
      setCustomTargets(targets);
    }
  };

  const handleSelectFF = () => {
    const ffCourses = flatCourses.filter((c) => resolveCourseGrade(c).letter === 'FF');
    const target = parseFloat(targetGPA);
    if (target && !isNaN(target)) {
      const { selectedIds, customTargets } = optimizeForTarget(ffCourses, target);
      setSelectedIds(selectedIds);
      setCustomTargets(customTargets);
    } else {
      const ffIds = new Set(ffCourses.map((c) => c.id));
      setSelectedIds(ffIds);
      const targets = {};
      ffCourses.forEach((c) => {
        targets[c.id] = 'DD';
      });
      setCustomTargets(targets);
    }
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
    setCustomTargets({});
  };

  const toggleCourse = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setCustomTargets((t) => {
          const nt = { ...t };
          delete nt[id];
          return nt;
        });
      } else {
        next.add(id);
        const c = flatCourses.find((x) => x.id === id);
        if (c) {
          setCustomTargets((t) => ({ ...t, [id]: resolveCourseGrade(c).letter }));
        }
      }
      return next;
    });
  };

  const setTargetLetter = (id, letter) => {
    setCustomTargets((prev) => ({ ...prev, [id]: letter }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#dee2e6] rounded-md p-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-[#333]">Transkript</h2>
        <div className="text-sm text-gray-600">
          Genel Ortalama (GNO): <span className="font-bold text-[#0056b3] text-lg">{totalGPA}</span>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded text-sm leading-relaxed">
        <p className="font-semibold mb-1">Bilgilendirme</p>
        <p>Okulunuz <strong>bağıl değerlendirme</strong> kullandığı için, 20+ kişilik derslerde buradaki harf notları ve GNO okulunuzunkinden farklı olabilir. Bu hesaplayıcı sadece mutlak puan aralıklarına göre çalışır.</p>
      </div>

      {keys.length === 0 && (
        <div className="bg-white border border-[#dee2e6] rounded-md p-8 text-center text-gray-400 text-sm">
          Henüz ders bulunmamaktadır.
        </div>
      )}

      {keys.map((term) => {
        const list = grouped[term];
        const stats = computeTermStats(list);
        return (
          <div key={term} className="bg-white border border-[#dee2e6] rounded-md overflow-hidden">
            <div className="bg-[#f0f2f5] px-4 py-3 border-b border-[#dee2e6] font-bold text-sm text-[#333] text-center">
              {term}
            </div>
            <div className="overflow-x-auto">
              <table className="portal-table w-full border-collapse">
                <thead>
                  <tr>
                    <th>Z/P</th>
                    <th className="text-left">Ders</th>
                    <th>Akts</th>
                    <th>Not</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((c) => {
                    const res = resolveCourseGrade(c);
                    return (
                      <tr key={c.id}>
                        <td>Z</td>
                        <td className="text-left">{c.code} {c.name}</td>
                        <td>{Number(c.ects).toFixed(2)}</td>
                        <td className="font-semibold">
                          {res.letter}
                          {res.isOverride && (
                            <span className="inline-flex items-center px-1 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700 ml-1" title="Harf notu manuel olarak belirlendi">M</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-[#fafbfc] font-semibold">
                    <td colSpan={2} className="text-right pr-4">Alınan Akts / Tamamlanan Akts / GNO</td>
                    <td>{stats.ectsTaken.toFixed(0)} / {stats.ectsCompleted.toFixed(0)}</td>
                    <td>{stats.gno}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Hedef GNO Simülatörü */}
      <div className="bg-white border border-[#dee2e6] rounded-md p-4 space-y-4">
        <h3 className="text-base font-bold text-[#333]">Hedef GNO Simülatörü</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Hedef GNO</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="4"
              value={targetGPA}
              onChange={(e) => setTargetGPA(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="Örn: 2.00"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleSelectFF}
              className="bg-[#0056b3] text-white text-sm font-medium px-4 py-2 rounded hover:bg-[#004494] transition"
            >
              FF'leri Seç
            </button>
            <button
              onClick={handleSelectAll}
              className="bg-white border border-gray-300 text-[#333] text-sm font-medium px-4 py-2 rounded hover:bg-[#f1f5f9] transition"
            >
              Tümünü Seç
            </button>
            <button
              onClick={handleClearSelection}
              className="bg-white border border-gray-300 text-[#333] text-sm font-medium px-4 py-2 rounded hover:bg-[#f1f5f9] transition"
            >
              Temizle
            </button>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Senaryo GNO: <span className="font-bold text-[#0056b3] text-lg">{scenarioGPA}</span>
            </div>
          </div>
        </div>

        {flatCourses.length > 0 && (
          <div className="overflow-x-auto border border-gray-200 rounded">
            <table className="w-full text-sm border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 text-gray-700 font-semibold">
                  <th className="px-3 py-2 border-b text-center w-10">Seç</th>
                  <th className="text-left px-3 py-2 border-b">Ders</th>
                  <th className="px-3 py-2 border-b">Akts</th>
                  <th className="px-3 py-2 border-b">Mevcut</th>
                  <th className="px-3 py-2 border-b">Hedef Not</th>
                  <th className="px-3 py-2 border-b">Gereken Final</th>
                </tr>
              </thead>
              <tbody>
                {flatCourses.map((c) => {
                  const res = resolveCourseGrade(c);
                  const isSelected = selectedIds.has(c.id);
                  const targetLetter = customTargets[c.id] || res.letter;
                  const needed = isSelected ? computeRequiredFinal(c, targetLetter) : null;
                  return (
                    <tr key={c.id} className={`hover:bg-gray-50 border-b last:border-b-0 ${isSelected ? 'bg-blue-50' : ''}`}>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCourse(c.id)}
                          className="accent-[#0056b3]"
                        />
                      </td>
                      <td className="px-3 py-2 text-left font-medium">{c.code} {c.name}</td>
                      <td className="px-3 py-2 text-center">{Number(c.ects).toFixed(2)}</td>
                      <td className="px-3 py-2 text-center font-semibold">{res.letter}</td>
                      <td className="px-3 py-2 text-center">
                        {isSelected ? (
                          <select
                            value={targetLetter}
                            onChange={(e) => setTargetLetter(c.id, e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                          >
                            {getLetterOptions().map((l) => (
                              <option key={l} value={l}>{l}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {needed ? (
                          needed.val !== null ? (
                            <span className={`font-semibold ${needed.color === 'red' ? 'text-red-600' : needed.color === 'green' ? 'text-green-600' : needed.color === 'orange' ? 'text-amber-600' : 'text-[#0056b3]'}`}>
                              {needed.val}
                              {needed.reason && <span className="text-xs block">{needed.reason}</span>}
                            </span>
                          ) : (
                            <span className="text-red-600 font-semibold">{needed.reason}</span>
                          )
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
