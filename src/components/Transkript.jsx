import { useMemo } from 'react';
import { calculateCourse, calculateGPA } from '../utils/grades';

const INCOMPLETE = ['FF', 'F', 'I0', 'I', 'NA', 'W', 'NI'];

export default function Transkript({ courses }) {
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
      const res = calculateCourse(c);
      ectsTaken += c.ects;
      if (!INCOMPLETE.includes(res.letter)) {
        ectsCompleted += c.ects;
      }
      const coefMap = { AA: 4.0, BA: 3.5, BB: 3.0, CB: 2.5, CC: 2.0, DC: 1.5, DD: 1.0, FF: 0.0, NA: 0, W: 0, NI: 0 };
      const coef = coefMap[res.letter];
      if (coef !== undefined && coef !== null) {
        totalPoints += coef * c.ects;
      }
    });
    const gno = ectsTaken > 0 ? parseFloat((totalPoints / ectsTaken).toFixed(2)) : 0;
    return { ectsTaken, ectsCompleted, gno };
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#dee2e6] rounded-md p-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-[#333]">Transkript</h2>
        <div className="text-sm text-gray-600">
          Genel Ortalama (GNO): <span className="font-bold text-[#0056b3] text-lg">{totalGPA}</span>
        </div>
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
                    const res = calculateCourse(c);
                    return (
                      <tr key={c.id}>
                        <td>Z</td>
                        <td className="text-left">{c.code} {c.name}</td>
                        <td>{Number(c.ects).toFixed(2)}</td>
                        <td className="font-semibold">{res.letter}</td>
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
    </div>
  );
}
