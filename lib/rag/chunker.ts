export interface ChunkResult {
  content: string;
  index: number;
}

export function chunkText(text: string, chunkSizeInWords: number = 300, overlapInWords: number = 50): ChunkResult[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const chunks: ChunkResult[] = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < words.length) {
    const endIndex = Math.min(startIndex + chunkSizeInWords, words.length);
    const chunkWords = words.slice(startIndex, endIndex);
    
    chunks.push({
      content: chunkWords.join(" "),
      index: chunkIndex,
    });

    if (endIndex === words.length) break;
    startIndex += chunkSizeInWords - overlapInWords;
    chunkIndex++;
  }

  return chunks;
}
