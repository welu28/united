"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { BookOpen, Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { logGameResult } from "@/lib/activity-logger"

interface Question {
  id: string
  question: string
  options: { id: string; text: string }[]
  correctAnswer: string
}

interface StudySet {
  id: string
  title: string
  description: string
  questionPairs?: Array<{ question: string; answer: string; options?: string[]; correctOption?: number }>
  questionCount: number
  createdAt: string
  type?: string
  isFavorite?: boolean // Add isFavorite prop
}

export default function TriviaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [studySets, setStudySets] = useState<StudySet[]>([])
  const [selectedStudySetId, setSelectedStudySetId] = useState<string>("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30) // Time to answer each question
  const [isGameOver, setIsGameOver] = useState(false)
  const [gameState, setGameState] = useState<"setup" | "playing" | "completed">("setup")

  // Load study sets on component mount and handle initial URL param
  useEffect(() => {
    const savedSets = JSON.parse(localStorage.getItem("studySets") || "[]")

    // Add mock sets if no saved sets exist
    const mockSets: StudySet[] = [
      {
        id: "mock-1",
        title: "Biology 101 - Cell Structure",
        description: "Sample biology questions",
        questionPairs: [
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
        ],
        questionCount: 3,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        type: "sample",
        isFavorite: false,
      },
      {
        id: "mock-2",
        title: "History - World War II",
        description: "Sample history questions",
        questionPairs: [
          {
            question: "When did World War II begin?",
            answer: "September 1, 1939",
            options: ["July 28, 1914", "September 1, 1939", "December 7, 1941", "May 8, 1945"],
            correctOption: 1,
          },
          {
            question: "Who was the Prime Minister of the United Kingdom during most of WWII?",
            answer: "Winston Churchill",
            options: ["Neville Chamberlain", "Winston Churchill", "Clement Attlee", "Harold Macmillan"],
            correctOption: 1,
          },
        ],
        questionCount: 2,
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
        type: "sample",
        isFavorite: false,
      },
    ]

    const allSets = savedSets.length > 0 ? [...savedSets, ...mockSets] : mockSets
    setStudySets(allSets)

    // Check for pre-selected set from URL
    const setIdFromUrl = searchParams.get("set")
    if (setIdFromUrl && allSets.some((set) => set.id === setIdFromUrl)) {
      setSelectedStudySetId(setIdFromUrl)
      const initialSet = allSets.find((set) => set.id === setIdFromUrl)
      if (initialSet && initialSet.questionPairs && initialSet.questionPairs.length > 0) {
        loadQuestionsFromSet(initialSet)
        setGameState("playing")
      }
    } else if (allSets.length > 0) {
      setSelectedStudySetId(allSets[0].id) // Default to the first set if no URL param
    }
  }, [])

  // Load questions when selectedStudySetId changes
  useEffect(() => {
    if (selectedStudySetId && studySets.length > 0 && gameState === "playing") {
      const selectedSet = studySets.find((set) => set.id === selectedStudySetId)
      if (selectedSet && selectedSet.questionPairs) {
        loadQuestionsFromSet(selectedSet)
      }
    }
  }, [selectedStudySetId, studySets, gameState])

  const loadQuestionsFromSet = (set: StudySet) => {
    const convertedQuestions: Question[] = set.questionPairs
      ? set.questionPairs.map((pair, index) => {
          // If options are not provided, generate simple A, B, C, D options
          const options =
            pair.options && pair.options.length > 0
              ? pair.options.map((opt, i) => ({ id: String.fromCharCode(97 + i), text: opt }))
              : [
                  { id: "a", text: pair.answer },
                  { id: "b", text: "Option B" }, // Placeholder, ideally generate wrong answers
                  { id: "c", text: "Option C" },
                  { id: "d", text: "Option D" },
                ]

          // If correctOption is not provided, assume the first option (the answer) is correct
          const correctAnswerId = pair.correctOption !== undefined ? options[pair.correctOption].id : options[0].id

          return {
            id: `${set.id}-${index}`,
            question: pair.question,
            options: options,
            correctAnswer: correctAnswerId,
          }
        })
      : []
    setQuestions(convertedQuestions)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setIsAnswerSubmitted(false)
    setScore(0)
    setTimeLeft(30)
    setIsGameOver(false)
  }

  const currentQuestion = questions[currentQuestionIndex]

  useEffect(() => {
    if (isGameOver || gameState !== "playing") return

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer)
          if (!isAnswerSubmitted) {
            handleSubmitAnswer()
          }
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isAnswerSubmitted, isGameOver, gameState, currentQuestionIndex])

  const handleAnswerSelect = (value: string) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(value)
    }
  }

  const handleSubmitAnswer = () => {
    if (isAnswerSubmitted) return

    setIsAnswerSubmitted(true)

    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(score + 1)
    }

    // Log game result for this question
    logGameResult({
      type: "trivia",
      score: selectedAnswer === currentQuestion.correctAnswer ? 1 : 0,
      questionsAnswered: 1,
      correctAnswers: selectedAnswer === currentQuestion.correctAnswer ? 1 : 0,
      studySetId: selectedStudySetId,
      studySetTitle: studySets.find((s) => s.id === selectedStudySetId)?.title,
      timestamp: new Date().toISOString(),
    })
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setIsAnswerSubmitted(false)
      setTimeLeft(30)
    } else {
      setIsGameOver(true)
      setGameState("completed")
    }
  }

  const handleRestartGame = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setIsAnswerSubmitted(false)
    setScore(0)
    setTimeLeft(30)
    setIsGameOver(false)
    setGameState("playing")
    const selectedSet = studySets.find((set) => set.id === selectedStudySetId)
    if (selectedSet) {
      loadQuestionsFromSet(selectedSet)
    }
  }

  const handleStartSession = () => {
    if (selectedStudySetId) {
      const selectedSet = studySets.find((set) => set.id === selectedStudySetId)
      if (selectedSet && selectedSet.questionPairs && selectedSet.questionPairs.length > 0) {
        loadQuestionsFromSet(selectedSet)
        setGameState("playing")
      } else {
        alert("Selected study set has no questions or could not be loaded.")
      }
    } else {
      alert("Please select a study set to start.")
    }
  }

  if (gameState === "setup" || studySets.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 bg-background border-b">
          <div className="flex h-16 items-center px-4 md:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <BookOpen className="h-6 w-6" />
              <span className="font-bold text-xl">-Dash</span>
            </Link>
            <nav className="ml-auto flex gap-4 sm:gap-6">
              <Link className="text-sm font-medium hover:underline underline-offset-4" href="/dashboard">
                Dashboard
              </Link>
              <Link className="text-sm font-medium hover:underline underline-offset-4" href="/flashcards">
                Flashcards
              </Link>
              <Link className="text-sm font-medium hover:underline underline-offset-4" href="/trivia">
                Trivia
              </Link>
              <Link className="text-sm font-medium hover:underline underline-offset-4" href="/qb-reader">
                QB Reader
              </Link>
              <Link className="text-sm font-medium hover:underline underline-offset-4" href="/profile">
                Profile
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 py-6 px-4 md:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="text-center space-y-6">
              <h1 className="text-2xl font-bold tracking-tight">Trivia Challenge</h1>
              {studySets.length === 0 ? (
                <div className="space-y-4">
                  <p className="text-gray-500">No study sets found. Create or upload study sets to play Trivia.</p>
                  <div className="flex gap-4 justify-center">
                    <Link href="/upload">
                      <Button>Upload Notes</Button>
                    </Link>
                    <Link href="/create">
                      <Button variant="outline">Create Manually</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Select Study Set</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Label htmlFor="study-set">Choose a study set to practice with:</Label>
                      <Select value={selectedStudySetId} onValueChange={setSelectedStudySetId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a study set" />
                        </SelectTrigger>
                        <SelectContent>
                          {studySets.map((set) => (
                            <SelectItem key={set.id} value={set.id}>
                              {set.title} ({set.questionCount} questions)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedStudySetId && (
                        <Button onClick={handleStartSession} className="w-full">
                          Start Trivia
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="flex h-16 items-center px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BookOpen className="h-6 w-6" />
            <span className="font-bold text-xl">-Dash</span>
          </Link>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/dashboard">
              Dashboard
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/flashcards">
              Flashcards
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/trivia">
              Trivia
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/qb-reader">
              QB Reader
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/profile">
              Profile
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 py-6 px-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="grid gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Trivia Challenge</h1>
                <p className="text-gray-500">
                  {studySets.find((s) => s.id === selectedStudySetId)?.title || "General Trivia"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{timeLeft}s</span>
                </div>
                <div className="bg-gray-100 px-3 py-1 rounded-full">
                  <span className="font-medium">
                    Score: {score}/{questions.length}
                  </span>
                </div>
              </div>
            </div>

            {!isGameOver ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </CardTitle>
                    <Progress value={(timeLeft / 30) * 100} className="w-24 h-2" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <h2 className="text-xl font-medium">{currentQuestion?.question}</h2>
                    <RadioGroup value={selectedAnswer || ""} className="space-y-3">
                      {currentQuestion?.options.map((option) => {
                        const isCorrect = option.id === currentQuestion.correctAnswer
                        const isSelected = option.id === selectedAnswer

                        let className = "flex items-center space-x-2 rounded-lg border p-4 cursor-pointer"

                        if (isAnswerSubmitted) {
                          if (isCorrect) {
                            className += " bg-green-50 border-green-200"
                          } else if (isSelected && !isCorrect) {
                            className += " bg-red-50 border-red-200"
                          }
                        } else {
                          className += " hover:bg-gray-50"
                        }

                        return (
                          <div key={option.id} className={className} onClick={() => handleAnswerSelect(option.id)}>
                            <RadioGroupItem
                              value={option.id}
                              id={option.id}
                              disabled={isAnswerSubmitted}
                              className="sr-only"
                            />
                            <Label htmlFor={option.id} className="w-full cursor-pointer text-base font-medium">
                              {option.text}
                            </Label>
                          </div>
                        )
                      })}
                    </RadioGroup>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  {!isAnswerSubmitted ? (
                    <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer}>
                      Submit Answer
                    </Button>
                  ) : (
                    <Button onClick={handleNextQuestion}>Next Question</Button>
                  )}
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Game Over!</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold">
                      Your Score: {score}/{questions.length}
                    </h2>
                    <p className="text-gray-500">
                      {score === questions.length
                        ? "Perfect score! Amazing job!"
                        : score >= questions.length / 2
                          ? "Good job! Keep practicing to improve."
                          : "Keep studying and try again!"}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center gap-4">
                  <Button onClick={handleRestartGame}>Play Again</Button>
                  <Button variant="outline" onClick={() => setGameState("setup")}>
                    Choose Different Set
                  </Button>
                  <Link href="/dashboard">
                    <Button variant="outline">Back to Dashboard</Button>
                  </Link>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
