"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, Zap } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Question {
  id: string
  text: string
  answer: string
  category: string
  difficulty: "easy" | "medium" | "hard"
}

export default function QBReaderPage() {
  // Mock questions for demonstration
  const mockQuestions: Question[] = [
    {
      id: "1",
      text: "This scientist developed the theory of general relativity and the mass-energy equivalence formula E=mc². He won the Nobel Prize in Physics in 1921 for his explanation of the photoelectric effect. Name this German-born theoretical physicist.",
      answer: "Albert Einstein",
      category: "Science",
      difficulty: "medium",
    },
    {
      id: "2",
      text: "This novel follows a man who buys a mansion across from the Buchanans in West Egg, Long Island. The title character throws lavish parties hoping to attract the attention of his lost love, Daisy. Name this F. Scott Fitzgerald novel.",
      answer: "The Great Gatsby",
      category: "Literature",
      difficulty: "medium",
    },
    {
      id: "3",
      text: "This battle in 1815 marked the final defeat of this French emperor by the Seventh Coalition forces under the Duke of Wellington and Gebhard von Blücher. Name this decisive battle fought in present-day Belgium.",
      answer: "Battle of Waterloo (Napoleon Bonaparte)",
      category: "History",
      difficulty: "medium",
    },
  ]

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [revealedWords, setRevealedWords] = useState<string[]>([])
  const [isRevealing, setIsRevealing] = useState(false)
  const [revealInterval, setRevealInterval] = useState<number>(300) // ms between words
  const [userAnswer, setUserAnswer] = useState("")
  const [gameState, setGameState] = useState<"ready" | "reading" | "buzzed" | "answered" | "completed">("ready")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(10) // seconds to answer after buzzing
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [showFeedback, setShowFeedback] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")

  const answerInputRef = useRef<HTMLInputElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const currentQuestion = mockQuestions[currentQuestionIndex]
  const words = currentQuestion?.text.split(" ") || []
  const percentRevealed = Math.floor((revealedWords.length / words.length) * 100)

  // Start revealing words
  const startReading = () => {
    setGameState("reading")
    setIsRevealing(true)
    setRevealedWords([words[0]])

    let wordIndex = 1

    intervalRef.current = setInterval(() => {
      if (wordIndex < words.length) {
        setRevealedWords((prev) => [...prev, words[wordIndex]])
        wordIndex++
      } else {
        clearInterval(intervalRef.current!)
        setIsRevealing(false)
      }
    }, revealInterval)
  }

  // Handle buzz-in
  const handleBuzz = () => {
    if (gameState !== "reading") return

    // Stop revealing words
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      setIsRevealing(false)
    }

    setGameState("buzzed")
    setTimeLeft(10)

    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          handleSubmitAnswer()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Focus the answer input
    setTimeout(() => {
      answerInputRef.current?.focus()
    }, 100)
  }

  // Handle answer submission
  const handleSubmitAnswer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    const isCorrect = userAnswer.toLowerCase().includes(currentQuestion.answer.toLowerCase())

    // Calculate points based on how early they buzzed
    const maxPoints = 100
    const pointsEarned = isCorrect ? Math.round(maxPoints * (1 - (revealedWords.length / words.length) * 0.7)) : -20 // Penalty for wrong answer

    if (isCorrect) {
      setFeedbackMessage(`Correct! +${pointsEarned} points`)
      setScore((prev) => prev + pointsEarned)
    } else {
      setFeedbackMessage(`Incorrect. The answer was "${currentQuestion.answer}". ${pointsEarned} points`)
      setScore((prev) => prev + pointsEarned)
    }

    setShowFeedback(true)
    setGameState("answered")
  }

  // Move to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < mockQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setRevealedWords([])
      setUserAnswer("")
      setGameState("ready")
      setShowFeedback(false)
    } else {
      setGameState("completed")
    }
  }

  // Continue revealing after incorrect answer
  const handleContinueReading = () => {
    setShowFeedback(false)
    setGameState("reading")
    setIsRevealing(true)

    let wordIndex = revealedWords.length

    intervalRef.current = setInterval(() => {
      if (wordIndex < words.length) {
        setRevealedWords((prev) => [...prev, words[wordIndex]])
        wordIndex++
      } else {
        clearInterval(intervalRef.current!)
        setIsRevealing(false)
      }
    }, revealInterval)
  }

  // Reset the game
  const handleRestart = () => {
    setCurrentQuestionIndex(0)
    setRevealedWords([])
    setUserAnswer("")
    setGameState("ready")
    setScore(0)
    setShowFeedback(false)
  }

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

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
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">QB Reader</h1>
                <p className="text-gray-500">Test your knowledge with word-by-word question reveals</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                  <span className="font-medium">Score: {score}</span>
                </div>
                {gameState === "buzzed" && (
                  <div className="flex items-center gap-2 bg-red-100 px-3 py-1 rounded-full">
                    <Clock className="h-4 w-4 text-red-500" />
                    <span className="font-medium text-red-500">{timeLeft}s</span>
                  </div>
                )}
              </div>
            </div>

            {gameState !== "completed" ? (
              <Card className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      Question {currentQuestionIndex + 1} of {mockQuestions.length}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="px-2 py-1 bg-gray-100 rounded-full">{currentQuestion.category}</span>
                      <span className="px-2 py-1 bg-gray-100 rounded-full capitalize">
                        {currentQuestion.difficulty}
                      </span>
                    </div>
                  </div>
                  <Progress value={percentRevealed} className="h-2 mt-2" />
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="min-h-[200px] flex flex-col justify-between">
                    <div className="mb-6">
                      {gameState === "ready" ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500 mb-4">Ready to start reading the question?</p>
                          <Button onClick={startReading}>Start Reading</Button>
                        </div>
                      ) : (
                        <div className="text-lg leading-relaxed">
                          {revealedWords.join(" ")}
                          {isRevealing && <span className="animate-pulse">|</span>}
                        </div>
                      )}
                    </div>

                    {gameState === "reading" && (
                      <div className="flex justify-center">
                        <Button onClick={handleBuzz} className="px-8 py-6 text-lg" variant="destructive">
                          <Zap className="mr-2 h-5 w-5" />
                          BUZZ
                        </Button>
                      </div>
                    )}

                    {gameState === "buzzed" && (
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            ref={answerInputRef}
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="Type your answer..."
                            className="flex-1"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSubmitAnswer()
                              }
                            }}
                          />
                          <Button onClick={handleSubmitAnswer}>Submit</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-2 flex justify-between">
                  <div className="text-sm text-gray-500">
                    {gameState === "reading" && "Click BUZZ when you know the answer!"}
                    {gameState === "buzzed" && "Type your answer and submit before time runs out!"}
                  </div>
                  {gameState === "answered" && !showFeedback && (
                    <Button onClick={handleNextQuestion}>Next Question</Button>
                  )}
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Game Completed!</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold">Final Score: {score}</h2>
                    <p className="text-gray-500">
                      {score > 200
                        ? "Amazing! You're a Quiz Bowl champion!"
                        : score > 100
                          ? "Great job! Keep practicing to improve."
                          : "Keep studying and try again!"}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center gap-4">
                  <Button onClick={handleRestart}>Play Again</Button>
                  <Link href="/dashboard">
                    <Button variant="outline">Back to Dashboard</Button>
                  </Link>
                </CardFooter>
              </Card>
            )}

            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Game Settings</h2>
              </div>
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="science">Science</SelectItem>
                          <SelectItem value="history">History</SelectItem>
                          <SelectItem value="literature">Literature</SelectItem>
                          <SelectItem value="arts">Arts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                        <SelectTrigger id="difficulty">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Difficulties</SelectItem>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="speed">Reading Speed</Label>
                      <div className="flex items-center gap-4">
                        <span className="text-sm">Slow</span>
                        <Input
                          id="speed"
                          type="range"
                          min="100"
                          max="500"
                          step="50"
                          value={revealInterval}
                          onChange={(e) => setRevealInterval(Number(e.target.value))}
                          className="flex-1"
                        />
                        <span className="text-sm">Fast</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Feedback Dialog */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{feedbackMessage.includes("Correct") ? "Correct Answer!" : "Incorrect Answer"}</DialogTitle>
            <DialogDescription>{feedbackMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between sm:justify-between">
            {!feedbackMessage.includes("Correct") && (
              <Button variant="outline" onClick={handleContinueReading}>
                Continue Reading
              </Button>
            )}
            <Button onClick={handleNextQuestion}>Next Question</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
