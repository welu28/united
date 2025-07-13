export interface QuestionAnswer {
  question: string
  answer: string
  options?: string[] // For multiple choice questions
  correctOption?: number // Index of the correct option
}

// Helper function for fuzzy matching
function normalizeAndSplit(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "") // Remove punctuation
    .replace(/\s{2,}/g, " ") // Replace multiple spaces with single space
    .trim()
    .split(" ")
    .filter((word) => word.length > 0) // Remove empty strings from split
}

export function checkAnswerSimilarity(userAnswer: string, correctAnswer: string): boolean {
  const userWords = normalizeAndSplit(userAnswer)
  const correctWords = normalizeAndSplit(correctAnswer)

  if (userWords.length === 0 || correctWords.length === 0) {
    return false
  }

  // Exact match after normalization
  if (userWords.join(" ") === correctWords.join(" ")) {
    return true
  }

  // Check if user answer contains the full correct answer (after normalization)
  if (userWords.join(" ").includes(correctWords.join(" "))) {
    return true
  }

  // Check if correct answer contains the full user answer (after normalization)
  if (correctWords.join(" ").includes(userWords.join(" "))) {
    return true
  }

  // Word overlap check (e.g., 70% of correct words are in user answer)
  let matchingWordsCount = 0
  for (const correctWord of correctWords) {
    if (userWords.includes(correctWord)) {
      matchingWordsCount++
    }
  }
  const overlapPercentage = matchingWordsCount / correctWords.length
  if (overlapPercentage >= 0.7) {
    // Threshold for "pretty similar"
    return true
  }

  return false
}
