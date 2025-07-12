"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { BookOpen, Clock } from "lucide-react"

export default function TriviaPage() {
  // Mock data for demonstration
  const mockQuestions = [
    {
      id: "1",
      question: "What is the powerhouse of the cell?",
      options: [
        { id: "a", text: "Nucleus" },
        { id: "b", text: "Mitochondria" },
        { id: "c", text: "Endoplasmic Reticulum" },
        { id: "d", text: "Golgi Apparatus" },
      ],
      correctAnswer: "b",
    },
    {
      id: "2",
      question: "Which of the following is NOT a nucleotide found in DNA?",
      options: [
        { id: "a", text: "Adenine" },
        { id: "b", text: "Guanine" },
        { id: "c", text: "Uracil" },
        { id: "d", text: "Thymine" },
      ],
      correctAnswer: "c",
    },
    {
      id: "3",
      question: "What process do plants use to convert light energy into chemical energy?",
      options: [
        { id: "a", text: "Respiration" },
        { id: "b", text: "Fermentation" },
        { id: "c", text: "Photosynthesis" },
        { id: "d", text: "Transpiration" },
      ],
      correctAnswer: "c",
    },
  ]

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [isGameOver, setIsGameOver] = useState(false)

  const currentQuestion = mockQuestions[currentQuestionIndex]

  useEffect(() => {
    if (isGameOver) return

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
  }, [isAnswerSubmitted, isGameOver])

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
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < mockQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setIsAnswerSubmitted(false)
      setTimeLeft(30)
    } else {
      setIsGameOver(true)
    }
  }

  const handleRestartGame = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setIsAnswerSubmitted(false)
    setScore(0)
    setTimeLeft(30)
    setIsGameOver(false)
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
                <p className="text-gray-500">Biology 101 - Cell Structure</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{timeLeft}s</span>
                </div>
                <div className="bg-gray-100 px-3 py-1 rounded-full">
                  <span className="font-medium">
                    Score: {score}/{mockQuestions.length}
                  </span>
                </div>
              </div>
            </div>

            {!isGameOver ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      Question {currentQuestionIndex + 1} of {mockQuestions.length}
                    </CardTitle>
                    <Progress value={(timeLeft / 30) * 100} className="w-24 h-2" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <h2 className="text-xl font-medium">{currentQuestion.question}</h2>
                    <RadioGroup value={selectedAnswer || ""} className="space-y-3">
                      {currentQuestion.options.map((option) => {
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
                      Your Score: {score}/{mockQuestions.length}
                    </h2>
                    <p className="text-gray-500">
                      {score === mockQuestions.length
                        ? "Perfect score! Amazing job!"
                        : score >= mockQuestions.length / 2
                          ? "Good job! Keep practicing to improve."
                          : "Keep studying and try again!"}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center gap-4">
                  <Button onClick={handleRestartGame}>Play Again</Button>
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
