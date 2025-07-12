export interface QuestionAnswer {
  question: string
  answer: string
  options?: string[] // For multiple choice questions
  correctOption?: number // Index of the correct option
}

export async function generateQuestionsFromText(text: string, count = 10): Promise<QuestionAnswer[]> {
  try {
    // This is a placeholder for actual AI integration
    // In a real implementation, you would use the AI SDK to generate questions

    // Example of how you might use the AI SDK:
    /*
    const prompt = `
    Generate ${count} question and answer pairs from the following text. 
    Format the response as a JSON array of objects with 'question' and 'answer' properties.
    
    Text: ${text}
    `;
    
    const { text: generatedText } = await generateText({
      model: openai("gpt-4o"),
      prompt,
    });
    
    return JSON.parse(generatedText);
    */

    // For now, return mock data
    return mockGenerateQuestions(count)
  } catch (error) {
    console.error("Error generating questions:", error)
    return []
  }
}

export async function generateMultipleChoiceQuestions(text: string, count = 5): Promise<QuestionAnswer[]> {
  try {
    // Placeholder for actual AI integration
    // In a real implementation, you would use the AI SDK to generate multiple choice questions

    // For now, return mock data
    return mockGenerateMultipleChoiceQuestions(count)
  } catch (error) {
    console.error("Error generating multiple choice questions:", error)
    return []
  }
}

// Mock functions for demonstration
function mockGenerateQuestions(count: number): QuestionAnswer[] {
  const questions: QuestionAnswer[] = [
    {
      question: "What is the powerhouse of the cell?",
      answer:
        "The mitochondria is the powerhouse of the cell. It generates most of the cell's supply of adenosine triphosphate (ATP), used as a source of chemical energy.",
    },
    {
      question: "What are the four nucleotides found in DNA?",
      answer: "The four nucleotides found in DNA are adenine (A), guanine (G), cytosine (C), and thymine (T).",
    },
    {
      question: "What is the process by which plants convert light energy into chemical energy?",
      answer:
        "Photosynthesis is the process by which plants convert light energy into chemical energy that can be used to fuel the organisms' activities.",
    },
    {
      question: "What is the function of the endoplasmic reticulum?",
      answer:
        "The endoplasmic reticulum (ER) is involved in the synthesis, folding, modification, and transport of proteins and lipids. The rough ER has ribosomes attached to it and is involved in protein synthesis, while the smooth ER is involved in lipid synthesis.",
    },
    {
      question: "What is the difference between prokaryotic and eukaryotic cells?",
      answer:
        "Prokaryotic cells lack a nucleus and membrane-bound organelles, while eukaryotic cells have a nucleus and membrane-bound organelles. Prokaryotes include bacteria and archaea, while eukaryotes include plants, animals, fungi, and protists.",
    },
  ]

  // Return the requested number of questions, or all if count is greater than available
  return questions.slice(0, Math.min(count, questions.length))
}

function mockGenerateMultipleChoiceQuestions(count: number): QuestionAnswer[] {
  const questions: QuestionAnswer[] = [
    {
      question: "What is the powerhouse of the cell?",
      answer: "Mitochondria",
      options: ["Nucleus", "Mitochondria", "Endoplasmic Reticulum", "Golgi Apparatus"],
      correctOption: 1,
    },
    {
      question: "Which of the following is NOT a nucleotide found in DNA?",
      answer: "Uracil",
      options: ["Adenine", "Guanine", "Uracil", "Thymine"],
      correctOption: 2,
    },
    {
      question: "What process do plants use to convert light energy into chemical energy?",
      answer: "Photosynthesis",
      options: ["Respiration", "Fermentation", "Photosynthesis", "Transpiration"],
      correctOption: 2,
    },
  ]

  return questions.slice(0, Math.min(count, questions.length))
}
