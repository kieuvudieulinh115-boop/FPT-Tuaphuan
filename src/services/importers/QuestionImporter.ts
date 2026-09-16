import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { Question } from '../../types';

// Set up pdf.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
}

export interface ParseResult {
  questions: Question[];
  errors: string[];
  totalParsed: number;
  needsConfirmationCount: number;
}

export class QuestionImporter {
  static async extractTextFromFile(file: File): Promise<string> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'docx') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }

    if (extension === 'pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = '';

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str || '')
            .join(' ');
          fullText += pageText + '\n';
        }

        return fullText;
      } catch (pdfErr) {
        console.warn('PDF.js worker extraction fallback:', pdfErr);
        return await file.text();
      }
    }

    // Default text/markdown
    return await file.text();
  }

  static parseQuestionsText(rawText: string): ParseResult {
    // 1. Normalize special characters, NBSP, tabs
    const cleanedText = rawText
      .replace(/\u00A0/g, ' ')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');

    // 2. Check if there is an Answer Table / Key Block at the bottom
    // e.g., "BẢNG ĐÁP ÁN: 1-A 2-B 3-C" or "1.A  2.B  3.C"
    const answerTableMap = new Map<number, 'A' | 'B' | 'C' | 'D'>();
    const answerTableRegex = /(?:bảng\s*đáp\s*án|đáp\s*án\s*các\s*câu|key\s*table|answer\s*key)[\s\:\-]+([^]*)$/i;
    const tableMatch = cleanedText.match(answerTableRegex);
    if (tableMatch && tableMatch[1]) {
      const tableContent = tableMatch[1];
      const pairRegex = /(?:câu\s*)?(\d+)[\s\.\:\-\/]+([A-Da-d])\b/g;
      let match;
      while ((match = pairRegex.exec(tableContent)) !== null) {
        const qNum = parseInt(match[1], 10);
        const ans = match[2].toUpperCase() as 'A' | 'B' | 'C' | 'D';
        answerTableMap.set(qNum, ans);
      }
    }

    // Work on text body (excluding separate answer key table if present)
    const bodyText = tableMatch ? cleanedText.slice(0, tableMatch.index) : cleanedText;

    const lines = bodyText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const questions: Question[] = [];
    const errors: string[] = [];

    // Group lines into question blocks
    // Pattern matches: "Câu 1:", "Câu 1.", "Câu 1 -", "Bài 1:", "1.", "1)", "1:", "Question 1:"
    const questionStartRegex = /^(?:câu|bài|question)\s*(\d+)?[\s\.\:\-\)]|^(\d+)[\.\:\)]\s+/i;

    const rawChunks: string[] = [];
    let currentChunk: string[] = [];

    for (const line of lines) {
      if (questionStartRegex.test(line) && currentChunk.length > 0) {
        rawChunks.push(currentChunk.join('\n'));
        currentChunk = [line];
      } else {
        currentChunk.push(line);
      }
    }
    if (currentChunk.length > 0) {
      rawChunks.push(currentChunk.join('\n'));
    }

    // Fallback: If no "Câu X" prefix detected at all, split by empty paragraphs
    const finalChunks = rawChunks.length > 0 ? rawChunks : cleanedText.split(/\n\s*\n+/);

    finalChunks.forEach((chunk, index) => {
      const chunkText = chunk.trim();
      if (!chunkText || chunkText.length < 5) return;

      // Extract question number if available
      const numMatch = chunkText.match(/^(?:câu|bài|question)?\s*(\d+)[\.\:\)\-]/i);
      const questionNumber = numMatch ? parseInt(numMatch[1], 10) : index + 1;

      // Extract Answer if explicitly stated in this chunk
      // Match patterns:
      // "Đáp án: B", "Đáp án đúng: C", "Đ/a: A", "Đ/A: B", "DA: A", "Key: D", "Answer: A", "Chọn: B"
      let correctOption: 'A' | 'B' | 'C' | 'D' = 'A';
      let foundAnswer = false;

      const ansMatch = chunkText.match(/(?:đáp\s*án(?:\s*đúng)?|đ\/[aá]|da|key|answer|chọn)[\s\:\.\-]+([A-Da-d])\b/i);
      if (ansMatch && ansMatch[1]) {
        correctOption = ansMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D';
        foundAnswer = true;
      } else if (answerTableMap.has(questionNumber)) {
        correctOption = answerTableMap.get(questionNumber)!;
        foundAnswer = true;
      }

      // Check if marked with asterisk like "*A." or "A*." or "*A)"
      if (!foundAnswer) {
        const starMatch = chunkText.match(/(?:\*\s*([A-Da-d])[\.\)\:\-]|\b([A-Da-d])\s*\*[\.\)\:\-])/);
        if (starMatch) {
          const optLetter = (starMatch[1] || starMatch[2]).toUpperCase() as 'A' | 'B' | 'C' | 'D';
          correctOption = optLetter;
          foundAnswer = true;
        }
      }

      // Extract Explanation if any
      let explanation = '';
      const explMatch = chunkText.match(/(?:giải\s*thích|lời\s*giải|ghi\s*chú|note)[\s\:\-]+([^]*)$/i);
      if (explMatch && explMatch[1]) {
        explanation = explMatch[1].trim();
      }

      // Clean the chunk for options extraction (remove explanation and trailing answer lines)
      let cleanForOptions = chunkText;
      if (explMatch) {
        cleanForOptions = cleanForOptions.replace(explMatch[0], '');
      }
      if (ansMatch) {
        cleanForOptions = cleanForOptions.replace(ansMatch[0], '');
      }

      // Extract Options A, B, C, D
      // Look for markers: A., B., C., D. OR A), B), C), D) OR [A], [B], [C], [D]
      const optPattern = /(?:^|\s|\n)(?:\*?\s*([A-Da-d])[\.\)\:\-]\s*|\(\s*([A-Da-d])\s*\)\s*|\[\s*([A-Da-d])\s*\]\s*)/g;

      // Find all option positions
      const matches: { letter: 'A' | 'B' | 'C' | 'D'; index: number; length: number }[] = [];
      let m;
      while ((m = optPattern.exec(cleanForOptions)) !== null) {
        const letter = (m[1] || m[2] || m[3]).toUpperCase() as 'A' | 'B' | 'C' | 'D';
        matches.push({ letter, index: m.index, length: m[0].length });
      }

      let optionA = '';
      let optionB = '';
      let optionC = '';
      let optionD = '';
      let content = '';

      if (matches.length >= 2) {
        // Content is everything before first option marker
        content = cleanForOptions.substring(0, matches[0].index).trim();

        // Extract option slices
        for (let i = 0; i < matches.length; i++) {
          const current = matches[i];
          const next = matches[i + 1];
          const start = current.index + current.length;
          const end = next ? next.index : cleanForOptions.length;
          const optText = cleanForOptions.substring(start, end).trim();

          if (current.letter === 'A' && !optionA) optionA = optText;
          else if (current.letter === 'B' && !optionB) optionB = optText;
          else if (current.letter === 'C' && !optionC) optionC = optText;
          else if (current.letter === 'D' && !optionD) optionD = optText;
        }
      } else {
        // Fallback option extraction with line-based regex
        const qMatch = cleanForOptions.match(/^(?:câu|bài|question|\d+[\.\:\)])\s*\d*[\.\:\-]?\s*([^]*?)(?=(?:[A-Da-d][\.\)\:\-]\s*)|$)/i);
        content = qMatch && qMatch[1] ? qMatch[1].trim() : cleanForOptions;

        const optAMatch = cleanForOptions.match(/(?:^|\n|\s)[Aa][\.\)\:\-]\s*([^]*?)(?=(?:(?:^|\n|\s)[Bb][\.\)\:\-])|$)/);
        const optBMatch = cleanForOptions.match(/(?:^|\n|\s)[Bb][\.\)\:\-]\s*([^]*?)(?=(?:(?:^|\n|\s)[Cc][\.\)\:\-])|$)/);
        const optCMatch = cleanForOptions.match(/(?:^|\n|\s)[Cc][\.\)\:\-]\s*([^]*?)(?=(?:(?:^|\n|\s)[Dd][\.\)\:\-])|$)/);
        const optDMatch = cleanForOptions.match(/(?:^|\n|\s)[Dd][\.\)\:\-]\s*([^]*?)$/);

        optionA = optAMatch ? optAMatch[1].trim() : '';
        optionB = optBMatch ? optBMatch[1].trim() : '';
        optionC = optCMatch ? optCMatch[1].trim() : '';
        optionD = optDMatch ? optDMatch[1].trim() : '';
      }

      // Clean up question content: remove leading "Câu 1:", "1.", etc.
      content = content
        .replace(/^(?:câu|bài|question)\s*\d*[\.\:\-\)]\s*/i, '')
        .replace(/^\d+[\.\:\)]\s*/, '')
        .replace(/\n+/g, ' ')
        .trim();

      // Clean options from remaining trailing artifacts
      const cleanOpt = (txt: string) => txt.replace(/\s+/g, ' ').replace(/\*+/g, '').trim();
      optionA = cleanOpt(optionA);
      optionB = cleanOpt(optionB);
      optionC = cleanOpt(optionC);
      optionD = cleanOpt(optionD);

      if (content && (optionA || optionB)) {
        questions.push({
          id: `imp_${Date.now()}_${index}`,
          content: content || `Câu hỏi số ${questionNumber}`,
          options: {
            A: optionA || 'Lựa chọn A',
            B: optionB || 'Lựa chọn B',
            C: optionC || 'Lựa chọn C',
            D: optionD || 'Lựa chọn D'
          },
          correctOption,
          needsTeacherConfirmation: !foundAnswer,
          explanation: explanation || undefined,
          subject: 'STEM Công Nghệ'
        });
      } else {
        errors.push(`Đoạn ${index + 1}: Thiếu nội dung câu hỏi hoặc phương án trả lời.`);
      }
    });

    const needsConfirmationCount = questions.filter(q => q.needsTeacherConfirmation).length;

    return {
      questions,
      errors,
      totalParsed: questions.length,
      needsConfirmationCount
    };
  }
}
