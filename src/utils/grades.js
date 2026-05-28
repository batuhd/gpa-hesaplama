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

export const calculateCourse = (course) => {
  let total = 0;
  let weightSum = 0;
  let finalScore = null;
  let hasFinal = false;

  course.exams.forEach((ex) => {
    const w = Number(ex.weight) || 0;
    if (w > 0) {
      if (ex.score !== null && ex.score !== undefined && ex.score !== '') {
        total += Number(ex.score) * (w / 100);
        weightSum += w;
      }
      if (ex.type === 'final') {
        hasFinal = true;
        finalScore = ex.score;
      }
    }
  });

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
