"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation" // Import useSearchParams
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, Zap, Pause, Play } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { logActivity } from "@/lib/activity-logger"
import { checkSemanticSimilarity } from "@/app/actions"

interface Question {
  id: string
  text: string
  answer: string
  category: string
  difficulty: "easy" | "medium" | "hard"
}

interface StudySet {
  id: string
  title: string
  description: string
  questionPairs?: Array<{ question: string; answer: string }>
  questionCount: number
  createdAt: string
  type?: string
}

export default function NoteDownPage() {
  const searchParams = useSearchParams() // Initialize useSearchParams
  const initialSetId = searchParams.get("set") // Get 'set' parameter from URL

  const [studySets, setStudySets] = useState<StudySet[]>([])
  const [selectedStudySetId, setSelectedStudySetId] = useState<string>(initialSetId || "") // Use initialSetId
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [revealedWords, setRevealedWords] = useState<string[]>([])
  const [isRevealing, setIsRevealing] = useState(false)
  const [revealInterval, setRevealInterval] = useState<number>(300) // ms between words
  const [userAnswer, setUserAnswer] = useState("")
  const [gameState, setGameState] = useState<"setup" | "ready" | "reading" | "buzzed" | "answered" | "completed">(
    "setup",
  )
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(10) // seconds to answer after buzzing
  const [questionStartTime, setQuestionStartTime] = useState<number>(0)
  const [questionTimeLimit] = useState(30) // Fixed at 30 seconds
  const [questionTimeLeft, setQuestionTimeLeft] = useState(30) // Countdown timer
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [showFeedback, setShowFeedback] = useState(false)
  const [questionResults, setQuestionResults] = useState<any[]>([]) // Changed to any[] for simplicity
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [incorrectAnswers, setIncorrectAnswers] = useState(0)
  const [userElo, setUserElo] = useState(1000) // Default ELO
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const answerInputRef = useRef<HTMLInputElement>(null)
  const wordRevealIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const answerTimerRef = useRef<NodeJS.Timeout | null>(null)
  const questionCountdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Function to clear all active intervals
  const clearAllIntervals = () => {
    if (wordRevealIntervalRef.current) {
      clearInterval(wordRevealIntervalRef.current)
      wordRevealIntervalRef.current = null
    }
    if (answerTimerRef.current) {
      clearInterval(answerTimerRef.current)
      answerTimerRef.current = null
    }
    if (questionCountdownIntervalRef.current) {
      clearInterval(questionCountdownIntervalRef.current)
      questionCountdownIntervalRef.current = null
    }
  }

  // Load study sets and ELO on component mount
  useEffect(() => {
    const savedSets = JSON.parse(localStorage.getItem("studySets") || "[]")
    setStudySets(savedSets)

    // If no initialSetId from URL, and there are sets, default to the first one
    if (!initialSetId && savedSets.length > 0) {
      setSelectedStudySetId(savedSets[0].id)
    } else if (initialSetId && savedSets.length > 0) {
      // If initialSetId exists, ensure it's a valid set, otherwise default to first
      const foundSet = savedSets.find((set: StudySet) => set.id === initialSetId)
      if (!foundSet) {
        setSelectedStudySetId(savedSets[0].id)
      }
    }

    const savedElo = localStorage.getItem("userElo")
    if (savedElo) {
      setUserElo(Number.parseInt(savedElo, 10))
    }

    return () => clearAllIntervals()
  }, [initialSetId]) // Add initialSetId to dependency array

  // Convert study set to questions when selected
  useEffect(() => {
    if (selectedStudySetId && studySets.length > 0) {
      const selectedSet = studySets.find((set) => set.id === selectedStudySetId)
      if (selectedSet && selectedSet.questionPairs) {
        const convertedQuestions: Question[] = selectedSet.questionPairs.map((pair, index) => ({
          id: `${selectedSet.id}-${index}`,
          text: pair.question,
          answer: pair.answer,
          category: selectedSet.title.split(" - ")[0] || "General",
          difficulty: "medium" as const,
        }))
        setQuestions(convertedQuestions)
        setGameState("ready")
        setCurrentQuestionIndex(0)
        setScore(0)
        setQuestionResults([])
        setCorrectAnswers(0)
        setIncorrectAnswers(0)
        setCurrentCardIndex(0)
        setIsPaused(false)
      } else {
        // If selected set has no question pairs, reset to setup state
        setQuestions([])
        setGameState("setup")
        alert("The selected study set has no questions. Please choose a different set or create/upload questions.")
      }
    }
  }, [selectedStudySetId, studySets])

  const currentQuestion = questions[currentQuestionIndex]
  const words = currentQuestion?.text.split(" ") || []
  const percentRevealed = Math.floor((revealedWords.length / words.length) * 100)

  // Function to start the word revealing process
  const startWordRevealing = () => {
    if (!currentQuestion || wordRevealIntervalRef.current) return

    let wordIndex = revealedWords.length
    wordRevealIntervalRef.current = setInterval(() => {
      if (wordIndex < words.length) {
        setRevealedWords((prev) => [...prev, words[wordIndex]])
        wordIndex++
      } else {
        // Only stop the word revealing interval, not the main question timer
        if (wordRevealIntervalRef.current) {
          clearInterval(wordRevealIntervalRef.current)
          wordRevealIntervalRef.current = null
        }
        setIsRevealing(false) // No more words to reveal
      }
    }, revealInterval)
  }

  // Function to start the question countdown timer
  const startQuestionCountdown = () => {
    if (!currentQuestion || questionCountdownIntervalRef.current) return

    questionCountdownIntervalRef.current = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          clearAllIntervals()
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Auto-start logic when a new question is ready
  useEffect(() => {
    if (gameState === "ready" && questions.length > 0 && currentQuestion) {
      clearAllIntervals()
      setIsPaused(false)
      setRevealedWords([])
      setQuestionTimeLeft(questionTimeLimit) // Fixed 30 seconds
      setGameState("reading")
      setIsRevealing(true)
      setQuestionStartTime(Date.now())
      startWordRevealing()
      startQuestionCountdown()
    }
  }, [gameState, questions, currentQuestionIndex, selectedStudySetId, questionTimeLimit])

  // Keyboard shortcut for buzzing
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === " " && gameState === "reading" && !isPaused) {
        event.preventDefault() // Prevent scrolling
        handleBuzz()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [gameState, isPaused])

  // Handle when time runs out
  const handleTimeUp = () => {
    clearAllIntervals()

    const timeToAnswer = Math.floor((Date.now() - questionStartTime) / 1000)

    const result: any = {
      questionId: currentQuestion.id,
      correct: false,
      userAnswer: userAnswer.trim() || "(no answer)",
      correctAnswer: currentQuestion.answer,
      timeToAnswer,
      pointsEarned: -10,
      timedOut: true,
    }

    setQuestionResults((prev) => [...prev, result])
    setScore((prev) => prev - 10)
    setIncorrectAnswers((prev) => prev + 1)

    const eloChange = -10
    const newElo = Math.max(userElo + eloChange, 800)
    setUserElo(newElo)
    localStorage.setItem("userElo", newElo.toString())
    logActivity({
      description: `NoteDown ELO changed by ${eloChange}. New ELO: ${newElo}`,
      type: "notedown",
    })

    setFeedbackMessage(`Time's up! The answer was "${currentQuestion.answer}". ${eloChange} ELO. New ELO: ${newElo}`)
    setShowFeedback(true)
    setGameState("answered")
  }

  // Handle buzz-in
  const handleBuzz = () => {
    if (gameState !== "reading" || isPaused) return

    clearAllIntervals()

    setGameState("buzzed")
    setTimeLeft(10)

    answerTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(answerTimerRef.current!)
          handleSubmitAnswer()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    setTimeout(() => {
      answerInputRef.current?.focus()
    }, 100)
  }

  // Handle answer submission
  const handleSubmitAnswer = async () => {
    clearAllIntervals()

    const timeToAnswer = Math.floor((Date.now() - questionStartTime) / 1000)

    const isCorrect = await checkSemanticSimilarity(userAnswer, currentQuestion.answer)

    const maxPoints = 100
    const pointsEarned = isCorrect ? Math.round(maxPoints * (1 - (revealedWords.length / words.length) * 0.85)) : -20

    const result: any = {
      questionId: currentQuestion.id,
      correct: isCorrect,
      userAnswer: userAnswer.trim() || "(no answer)",
      correctAnswer: currentQuestion.answer,
      timeToAnswer,
      pointsEarned,
      timedOut: false,
    }

    setQuestionResults((prev) => [...prev, result])

    let eloChange = 0
    if (isCorrect) {
      setScore((prev) => prev + pointsEarned)
      setCorrectAnswers((prev) => prev + 1)
      eloChange = 25
    } else {
      setScore((prev) => prev + pointsEarned)
      setIncorrectAnswers((prev) => prev + 1)
      eloChange = -15
    }

    const newElo = Math.max(userElo + eloChange, 800)
    setUserElo(newElo)
    localStorage.setItem("userElo", newElo.toString())
    logActivity({
      description: `NoteDown ELO changed by ${eloChange}. New ELO: ${newElo}`,
      type: "notedown",
    })

    setFeedbackMessage(
      isCorrect
        ? `Correct! +${pointsEarned} points. ${eloChange > 0 ? "+" : ""}${eloChange} ELO. New ELO: ${newElo}`
        : `Incorrect. The answer was "${currentQuestion.answer}". ${pointsEarned} points. ${eloChange} ELO. New ELO: ${newElo}`,
    )
    setShowFeedback(true)
    setGameState("answered")
  }

  // Move to next question or complete game
  const handleNextQuestion = () => {
    clearAllIntervals()
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setCurrentCardIndex((prev) => prev + 1)
      setRevealedWords([])
      setUserAnswer("")
      setGameState("ready")
      setShowFeedback(false)
      setTimeLeft(10)
    } else {
      logGameResults()
      setGameState("completed")
      setShowFeedback(false)
    }
  }

  // Log game results to localStorage
  const logGameResults = () => {
    const gameResult = {
      type: "notedown" as const,
      score,
      questionsAnswered: questions.length,
      correctAnswers,
      studySetId: selectedStudySetId,
      studySetTitle: studySets.find((s) => s.id === selectedStudySetId)?.title,
      timestamp: new Date().toISOString(),
      results: questionResults,
    }

    const gameHistory = JSON.parse(localStorage.getItem("gameHistory") || "[]")
    gameHistory.push(gameResult)
    localStorage.setItem("gameHistory", JSON.stringify(gameHistory))

    const activityLog = JSON.parse(localStorage.getItem("activityLog") || "[]")
    const accuracy = Math.round((correctAnswers / questions.length) * 100)
    activityLog.push({
      timestamp: new Date().toISOString(),
      description: `Completed NoteDown session - ${accuracy}% accuracy (${correctAnswers}/${questions.length}) - ${gameResult.studySetTitle}`,
      type: "notedown",
      score,
      studySetId: selectedStudySetId,
    })
    localStorage.setItem("activityLog", JSON.stringify(activityLog))
  }

  // Reset the game
  const handleRestart = () => {
    clearAllIntervals()
    setCurrentQuestionIndex(0)
    setCurrentCardIndex(0)
    setRevealedWords([])
    setUserAnswer("")
    setGameState("ready")
    setScore(0)
    setShowFeedback(false)
    setQuestionResults([])
    setCorrectAnswers(0)
    setIncorrectAnswers(0)
    setTimeLeft(10)
  }

  // Pause/Resume toggle
  const handlePauseToggle = () => {
    if (isPaused) {
      setIsPaused(false)
      startWordRevealing()
      startQuestionCountdown()
    } else {
      setIsPaused(true)
      clearAllIntervals()
    }
  }

  if (gameState === "setup" || studySets.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 bg-background border-b">
          <div className="flex h-16 items-center px-4 md:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <BookOpen className="h-6 w-6" />
              <span className="font-bold text-xl">Noteify</span>
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
              <Link className="text-sm font-medium hover:underline underline-offset-4" href="/notedown">
                NoteDown
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
              <h1 className="text-2xl font-bold tracking-tight">NoteDown</h1>
              {studySets.length === 0 ? (
                <div className="space-y-4">
                  <p className="text-gray-500">No study sets found. Create or upload study sets to use NoteDown.</p>
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
                        <Button onClick={() => setGameState("ready")} className="w-full">
                          Start NoteDown
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
            <span className="font-bold text-xl">Noteify</span>
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
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/notedown">
              NoteDown
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
                <h1 className="text-2xl font-bold tracking-tight">NoteDown</h1>
                <p className="text-gray-500">
                  {studySets.find((s) => s.id === selectedStudySetId)?.title || "Practice with word-by-word reveals"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                  <span className="font-medium">Score: {score}</span>
                </div>
                <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
                  <span className="font-medium text-green-600">✓ {correctAnswers}</span>
                </div>
                <div className="flex items-center gap-2 bg-red-100 px-3 py-1 rounded-full">
                  <span className="font-medium text-red-600">✗ {incorrectAnswers}</span>
                </div>
                <div className="flex items-center gap-2 bg-purple-100 px-3 py-1 rounded-full">
                  <span className="font-medium text-purple-600">ELO: {userElo}</span>
                </div>
                {(gameState === "reading" || gameState === "buzzed") && (
                  <Button variant="outline" size="sm" onClick={handlePauseToggle}>
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    <span className="sr-only">{isPaused ? "Resume" : "Pause"}</span>
                  </Button>
                )}
                {gameState === "buzzed" && (
                  <div className="flex items-center gap-2 bg-red-100 px-3 py-1 rounded-full">
                    <Clock className="h-4 w-4 text-red-500" />
                    <span className="font-medium text-red-500">{timeLeft}s</span>
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={() => setGameState("setup")}>
                  Change Study Set
                </Button>
              </div>
            </div>

            {gameState !== "completed" ? (
              <Card className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      Question {currentCardIndex + 1} of {questions.length}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm">
                      <div
                        className={`flex items-center gap-2 px-2 py-1 rounded-full ${
                          questionTimeLeft <= 10
                            ? "bg-red-100"
                            : questionTimeLeft <= 30
                              ? "bg-yellow-100"
                              : "bg-blue-100"
                        }`}
                      >
                        <Clock
                          className={`h-3 w-3 ${
                            questionTimeLeft <= 10
                              ? "text-red-500"
                              : questionTimeLeft <= 30
                                ? "text-yellow-600"
                                : "text-blue-500"
                          }`}
                        />
                        <span
                          className={`font-medium ${
                            questionTimeLeft <= 10
                              ? "text-red-600"
                              : questionTimeLeft <= 30
                                ? "text-yellow-600"
                                : "text-blue-600"
                          }`}
                        >
                          {questionTimeLeft}s
                        </span>
                      </div>
                      <span className="px-2 py-1 bg-gray-100 rounded-full">{currentQuestion?.category}</span>
                      <span className="px-2 py-1 bg-gray-100 rounded-full capitalize">
                        {currentQuestion?.difficulty}
                      </span>
                    </div>
                  </div>
                  <Progress value={percentRevealed} className="h-2 mt-2" />
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="min-h-[200px] flex flex-col justify-between">
                    {isPaused ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">Game Paused</p>
                        <Button onClick={handlePauseToggle}>
                          <Play className="mr-2 h-4 w-4" />
                          Resume
                        </Button>
                      </div>
                    ) : (
                      <div className="text-lg leading-relaxed mb-6">
                        {revealedWords.join(" ")}
                        {isRevealing && <span className="animate-pulse">|</span>}
                      </div>
                    )}

                    {gameState === "reading" && !isPaused && (
                      <div className="flex flex-col items-center gap-2">
                        <Button onClick={handleBuzz} className="px-8 py-6 text-lg" variant="destructive">
                          <Zap className="mr-2 h-5 w-5" />
                          BUZZ
                        </Button>
                        <p className="text-sm text-gray-500">Press Space to Buzz!</p>
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
                    {gameState === "reading" && !isPaused && "Click BUZZ when you know the answer!"}
                    {gameState === "buzzed" && "Type your answer and submit before time runs out!"}
                    {isPaused && "Click Resume to continue."}
                  </div>
                  {gameState === "answered" && !showFeedback && (
                    <Button onClick={handleNextQuestion}>
                      {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Game"}
                    </Button>
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
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">{correctAnswers}</div>
                        <p className="text-sm text-gray-500">Correct</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-red-600">{incorrectAnswers}</div>
                        <p className="text-sm text-gray-500">Incorrect</p>
                      </div>
                    </div>
                    <p className="text-gray-500">Accuracy: {Math.round((correctAnswers / questions.length) * 100)}%</p>
                    <p className="text-gray-500">
                      {correctAnswers === questions.length
                        ? "Perfect score! Amazing job!"
                        : correctAnswers >= questions.length / 2
                          ? "Great job! Keep practicing to improve."
                          : "Keep studying and try again!"}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center gap-4">
                  <Button onClick={handleRestart}>Play Again</Button>
                  <Button variant="outline" onClick={() => setGameState("setup")}>
                    Choose Different Set
                  </Button>
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
            <DialogTitle>
              {feedbackMessage.includes("Correct")
                ? "Correct Answer!"
                : feedbackMessage.includes("Time's up")
                  ? "Time's Up!"
                  : "Incorrect Answer"}
            </DialogTitle>
            <DialogDescription>{feedbackMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleNextQuestion}>
              {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Game"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
