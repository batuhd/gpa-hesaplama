// src/utils/altinbasParser.js
// Parses raw text copied from the Altınbaş university exam results page.

const EXAM_INFO_REGEX = /^.+\/.+\/\s*[\d.,]+%?/;

function detectTermAndYear(lines) {
  for (const line of lines) {
    const match = line.match(/(\d{4}-\d{4}).*?\b(Güz|Bahar)\b/i);
    if (match) {
      return { year: match[1], term: match[2] === 'Güz' ? 'Güz' : 'Bahar' };
    }
  }
  return { year: '', term: '' };
}

function parseExamInfo(text) {
  const parts = text.split('/').map((p) => p.trim());
  if (parts.length < 2) return null;

  const name = parts[0];
  const typeRaw = (parts[1] || '').toLowerCase();
  const isFinal =
    typeRaw.includes('yılsonu') ||
    typeRaw.includes('yilsonu') ||
    typeRaw.includes('final') ||
    typeRaw.includes('bütünleme') ||
    typeRaw.includes('butunleme');
  const type = isFinal ? 'final' : 'other';

  let weight = 0;
  if (parts.length >= 3) {
    const weightMatch = parts[2].match(/([\d.,]+)/);
    if (weightMatch) {
      weight = parseFloat(weightMatch[1].replace(',', '.')) || 0;
    }
  }

  return { name, type, weight };
}

function parseScore(scoreText, statusText) {
  if (!scoreText || scoreText.trim() === '') return null;
  if (statusText && statusText.includes('Edilmedi')) return null;
  const cleaned = scoreText.trim().replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function parseAltinbasText(text, fallbackYear = '', fallbackTerm = '') {
  const lines = text.split(/\r?\n/);
  const detected = detectTermAndYear(lines);
  const year = fallbackYear || detected.year || '2025-2026';
  const term = fallbackTerm || detected.term || 'Bahar';

  const courses = [];
  let currentCourse = null;
  let idCounter = 0;

  for (const line of lines) {
    if (!line.trim()) continue;

    // Stop at footer
    if (line.includes('EWI - ALTINBAS')) break;
    if (line.includes('©')) break;

    // Check if line starts with a course code (e.g. YBS110, IKT180)
    const codeMatch = line.match(/^([A-Z]{2,6}\d{3,4})\t/);
    if (codeMatch) {
      const parts = line.split('\t');
      if (parts.length >= 6) {
        const code = parts[0].trim();
        const name = parts[1].trim();
        const credit = parseFloat(parts[2]) || 0;
        const akts = parseFloat(parts[3]) || 0;

        // parts[4] is either letter grade or (if missing) shifted exam info
        let letterGrade = '';
        let examIdx = 5;
        const p4 = parts[4] ? parts[4].trim() : '';
        if (p4 && !p4.includes('/') && !p4.includes('%')) {
          letterGrade = p4;
        } else if (p4 && (p4.includes('/') || p4.includes('%'))) {
          letterGrade = '';
          examIdx = 4;
        }

        const examInfo = parts[examIdx] ? parts[examIdx].trim() : '';
        const scoreText = parts[examIdx + 1] ? parts[examIdx + 1].trim() : '';
        const statusText = parts[examIdx + 2] ? parts[examIdx + 2].trim() : '';

        const exams = [];
        if (examInfo && EXAM_INFO_REGEX.test(examInfo)) {
          const exam = parseExamInfo(examInfo);
          if (exam) {
            exam.score = parseScore(scoreText, statusText);
            exam.id = makeId();
            exams.push(exam);
          }
        }

        currentCourse = {
          id: Date.now() + idCounter++,
          code,
          name,
          credit,
          ects: akts,
          finalThreshold: 0,
          term,
          year,
          exams,
          universityLetter: letterGrade || null,
        };
        courses.push(currentCourse);
      }
    } else if (currentCourse) {
      // Try to parse as additional exam line for the current course
      const parts = line.split('\t');
      // Remove leading empty parts (from table column alignment)
      while (parts.length > 0 && parts[0].trim() === '') {
        parts.shift();
      }

      if (parts.length > 0) {
        const examInfo = parts[0].trim();
        const scoreText = parts[1] ? parts[1].trim() : '';
        const statusText = parts[2] ? parts[2].trim() : '';

        if (examInfo && EXAM_INFO_REGEX.test(examInfo)) {
          const exam = parseExamInfo(examInfo);
          if (exam) {
            exam.score = parseScore(scoreText, statusText);
            exam.id = makeId();
            currentCourse.exams.push(exam);
          }
        } else if (!line.match(/^[A-Z]{1,6}\d{1,4}/)) {
          // Doesn't look like a new course line either; break the chain
          currentCourse = null;
        }
      }
    }
  }

  return { courses, year, term };
}
