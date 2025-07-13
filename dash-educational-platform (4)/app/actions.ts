"use server"

import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import type { QuestionAnswer } from "@/lib/ai-utils"

export async function generateQuestionsAction(
  sourceContent: string,
  sourceType: "text" | "topic",
): Promise<QuestionAnswer[]> {
  try {
    let prompt: string

    if (sourceType === "topic") {
      prompt = `
      Generate 10-15 question and answer pairs about the topic: "${sourceContent}".
      Each question should be a short, concise statement or query, and the answer should be the direct, factual response.
      Ensure the questions are suitable for a quiz bowl style game (i.e., they can be read word-by-word and buzzed on).
      Crucially, ensure all generated questions and answers are factually correct, grammatically sound, and naturally phrased.
      Do not include any introductory or concluding remarks, just the JSON array.
      `
    } else {
      // sourceType === "text"
      prompt = `
      Generate 10-15 question and answer pairs from the following text.
      Each question should be a short, concise statement or query, and the answer should be the direct, factual response.
      Ensure the questions are suitable for a quiz bowl style game (i.e., they can be read word-by-word and buzzed on).
      Crucially, ensure all generated questions are grammatically correct and naturally phrased, and that the answers are directly derivable from the provided text and factually accurate within that context.
      Do not include any introductory or concluding remarks, just the JSON array.

      Text to generate questions from:
      ${sourceContent}
      `
    }

    const { text: generatedText } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt,
      temperature: 0.7,
    })

    let raw = generatedText.trim()

    raw = raw
      .replace(/```(?:json)?/gi, "")
      .replace(/```/g, "")
      .trim()

    const start = raw.indexOf("[")
    const end = raw.lastIndexOf("]")

    if (start === -1 || end === -1 || end <= start) {
      console.error("Could not locate JSON array in AI output:", generatedText)
      return []
    }

    const jsonSlice = raw.slice(start, end + 1)

    try {
      const parsedQuestions = JSON.parse(jsonSlice)
      if (
        Array.isArray(parsedQuestions) &&
        parsedQuestions.every((item) => typeof item === "object" && "question" in item && "answer" in item)
      ) {
        return parsedQuestions as QuestionAnswer[]
      }
      console.error("Parsed content is not an array of {question,answer}:", parsedQuestions)
      return []
    } catch (parseError) {
      console.error("Failed to parse extracted JSON:", parseError, "Raw slice:", jsonSlice)
      return []
    }
  } catch (error) {
    console.error("Error generating questions with AI:", error)
    return []
  }
}

export async function checkSemanticSimilarity(userAnswer: string, correctAnswer: string): Promise<boolean> {
  try {
    const prompt = `
    You are an intelligent judge for a quiz game. Your task is to determine if a user's answer is semantically similar or equivalent to the correct answer.
    Consider common synonyms, rephrasing, and minor omissions/additions that do not change the core meaning.
    Respond with ONLY 'true' or 'false'. Do not include any other text or punctuation.

    User's Answer: "${userAnswer}"
    Correct Answer: "${correctAnswer}"
    `

    const { text: result } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt,
      temperature: 0.1,
    })

    return result.trim().toLowerCase() === "true"
  } catch (error) {
    console.error("Error checking semantic similarity with AI:", error)
    return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
  }
}
