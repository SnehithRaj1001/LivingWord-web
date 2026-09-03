export interface ParsedScriptureRef {
  rawMatch: string;
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
}

// Regex to capture Bible references like "John 3:16", "1 Cor 13:4-7", "Rom 8:28", "Gen 1:1"
const SCRIPTURE_REGEX = /\b((?:[1-3]\s+)?[A-Z][a-z]+(?:\.|\b))\s+(\d+):(\d+)(?:-(\d+))?\b/g;

export function parseScriptureReferences(text: string): ParsedScriptureRef[] {
  const matches: ParsedScriptureRef[] = [];
  let match: RegExpExecArray | null;

  while ((match = SCRIPTURE_REGEX.exec(text)) !== null) {
    const [rawMatch, book, chapterStr, vStartStr, vEndStr] = match;
    matches.push({
      rawMatch,
      book: book.trim().replace(/\.$/, ""),
      chapter: parseInt(chapterStr, 10),
      verseStart: parseInt(vStartStr, 10),
      verseEnd: vEndStr ? parseInt(vEndStr, 10) : undefined,
    });
  }

  return matches;
}
