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
  // Altınbaş Üniversitesi Mutlak Değerlendirme Tablosu (Tablo 1)
  if (rounded >= 90) return { letter: 'AA', isThresholdFail: false };
  if (rounded >= 79) return { letter: 'BA', isThresholdFail: false };
  if (rounded >= 68) return { letter: 'BB', isThresholdFail: false };
  if (rounded >= 61) return { letter: 'CB', isThresholdFail: false };
  if (rounded >= 54) return { letter: 'CC', isThresholdFail: false };
  if (rounded >= 47) return { letter: 'DC', isThresholdFail: false };
  if (rounded >= 39) return { letter: 'DD', isThresholdFail: false };
  return { letter: 'FF', isThresholdFail: false };
};

function findFinalExam(exams) {
  if (!exams || exams.length === 0) return null;
  let exam = exams.find((e) => e.type === 'final');
  if (exam) return exam;
  exam = exams.find((e) =>
    /final|bütünleme|bütunleme|yılsonu|yıl sonu|yilsonu|yil sonu/i.test(e.name)
  );
  if (exam) return exam;
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

export const resolveCourseGrade = (course) => {
  if (course.overrideActive && course.overrideLetter && GRADE_MAP[course.overrideLetter] !== undefined) {
    return { average: null, letter: course.overrideLetter, isThresholdFail: false, weightSum: 0, isOverride: true };
  }
  return { ...calculateCourse(course), isOverride: false };
};

export const calculateGPA = (courses) => {
  let totalPoints = 0;
  let totalEcts = 0;
  courses.forEach((c) => {
    const result = resolveCourseGrade(c);
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

export const getLetterThreshold = (letter) => {
  const thresholds = {
    AA: 90, BA: 79, BB: 68, CB: 61, CC: 54, DC: 47, DD: 39, FF: 0
  };
  return thresholds[letter] ?? 0;
};

export const computePreFinal = (course) => {
  const finalExam = findFinalExam(course.exams);
  if (!finalExam) return { preFinal: 0, finalWeight: 0, finalExam: null };
  let sum = 0;
  let wSum = 0;
  course.exams.forEach((e) => {
    if (e.id !== finalExam.id && e.score !== null && e.score !== undefined && e.score !== '') {
      sum += Number(e.score) * (Number(e.weight) / 100);
      wSum += Number(e.weight);
    }
  });
  return {
    preFinal: wSum > 0 ? parseFloat(((sum / wSum) * 100).toFixed(2)) : 0,
    finalWeight: Number(finalExam.weight) || 0,
    finalExam,
  };
};

export const computeRequiredFinal = (course, targetLetter) => {
  const { preFinal, finalWeight } = computePreFinal(course);
  if (finalWeight === 0) return null;
  const targetMin = getLetterThreshold(targetLetter);
  const vizeW = 100 - finalWeight;
  const needed = (targetMin - (preFinal * (vizeW / 100))) / (finalWeight / 100);
  const ceilNeeded = Math.ceil(needed);
  const threshold = Number(course.finalThreshold) || 0;

  if (ceilNeeded > 100) return { val: null, reason: 'İmkansız', color: 'red' };
  if (ceilNeeded <= 0) {
    if (threshold > 0) return { val: threshold, reason: `Baraj: ${threshold}`, color: 'orange' };
    return { val: 0, reason: 'Yeterli', color: 'green' };
  }
  if (threshold > 0 && ceilNeeded < threshold) {
    return { val: threshold, reason: `Baraj: ${threshold}`, color: 'red' };
  }
  return { val: ceilNeeded, reason: null, color: 'blue' };
};

export const getLetterOptions = () => {
  return ['AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD', 'FF'];
};
