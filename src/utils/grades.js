export const GRADE_MAP = {
  AA: 4.0,
  BA: 3.5,
  BB: 3.0,
  CB: 2.5,
  CC: 2.0,
  DC: 1.5,
  DD: 1.0,
  FF: 0.0,
  S: null,
  M: null,
  U: null,
  P: null,
  EX: null,
  I: null,
  I0: null,
  NA: 0,
  W: 0,
  NI: 0,
};

export const getLetterFromScore = (score, finalScore, finalThreshold = 0) => {
  const rounded = Math.round(score);
  if (finalThreshold > 0 && finalScore !== null && finalScore !== undefined && finalScore !== '' && Number(finalScore) < finalThreshold) {
    return { letter: 'FF', isThresholdFail: true };
  }
  if (rounded >= 90) return { letter: 'AA', isThresholdFail: false };
  if (rounded >= 80) return { letter: 'BA', isThresholdFail: false };
  if (rounded >= 70) return { letter: 'BB', isThresholdFail: false };
  if (rounded >= 60) return { letter: 'CB', isThresholdFail: false };
  if (rounded >= 55) return { letter: 'CC', isThresholdFail: false };
  if (rounded >= 50) return { letter: 'DC', isThresholdFail: false };
  if (rounded >= 45) return { letter: 'DD', isThresholdFail: false };
  return { letter: 'FF', isThresholdFail: false };
};

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

export const calculateCourse = (course) => {
  let total = 0;
  let weightSum = 0;

  course.exams.forEach((ex) => {
    const w = Number(ex.weight) || 0;
    if (w > 0 && ex.score !== null && ex.score !== undefined && ex.score !== '') {
      total += Number(ex.score) * (w / 100);
      weightSum += w;
    }
  });

  // Final sınavını bul (tip veya isimden)
  const finalExam = findFinalExam(course.exams);
  const finalScore = finalExam ? finalExam.score : null;
  const hasFinal = finalExam && finalExam.score !== null && finalExam.score !== undefined && finalExam.score !== '';

  const average = parseFloat(total.toFixed(2));
  const { letter, isThresholdFail } = getLetterFromScore(
    average,
    hasFinal ? finalScore : null,
    Number(course.finalThreshold) || 0
  );

  return { average, letter, isThresholdFail, weightSum };
};

export const calculateGPA = (courses) => {
  let totalPoints = 0;
  let totalEcts = 0;
  courses.forEach((c) => {
    const result = calculateCourse(c);
    const coef = GRADE_MAP[result.letter];
    if (coef !== null && coef !== undefined) {
      totalPoints += coef * c.ects;
      totalEcts += c.ects;
    }
  });
  if (totalEcts === 0) return 0;
  return parseFloat((totalPoints / totalEcts).toFixed(2));
};

export const getCoefficient = (letter) => {
  return GRADE_MAP[letter] !== undefined ? GRADE_MAP[letter] : null;
};
