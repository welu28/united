"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { logGameResult } from "@/lib/activity-logger"
import { CardHeader, CardFooter, CardTitle } from "@/components/ui/card"

interface Flashcard {
  id: string
  question: string
  answer: string
}

interface StudySet {
  id: string
  title: string
  description: string
  questionPairs?: Array<{ question: string; answer: string }>
  questionCount: number
  createdAt: string
  type?: string
  isFavorite?: boolean
}

export default function FlashcardsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [studySets, setStudySets] = useState<StudySet[]>([])
  const [selectedStudySetId, setSelectedStudySetId] = useState<string>("")
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [completedCards, setCompletedCards] = useState<string[]>([])
  const [gameState, setGameState] = useState<"setup" | "playing" | "completed">("setup")

  // Load study sets on component mount and handle initial URL param
  useEffect(() => {
    const savedSets = JSON.parse(localStorage.getItem("studySets") || "[]")
    setStudySets(savedSets)

    // Check for pre-selected set from URL
    const setIdFromUrl = searchParams.get("set")
    if (setIdFromUrl && savedSets.some((set: StudySet) => set.id === setIdFromUrl)) {
      setSelectedStudySetId(setIdFromUrl)
      const initialSet = savedSets.find((set: StudySet) => set.id === setIdFromUrl)
      if (initialSet && initialSet.questionPairs && initialSet.questionPairs.length > 0) {
        setFlashcards(
          initialSet.questionPairs.map((pair, index) => ({
            id: `${initialSet.id}-${index}`,
            question: pair.question,
            answer: pair.answer,
          })),
        )
        setGameState("playing")
      }
    } else if (savedSets.length > 0) {
      setSelectedStudySetId(savedSets[0].id) // Default to the first set if no URL param
    }
  }, []) // Run once on mount; avoids re-running every render

  const currentCard = flashcards[currentCardIndex]

  const handleNextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setIsFlipped(false)
    } else {
      // All cards reviewed
      setGameState("completed")
      logGameResult({
        type: "flashcard",
        score: completedCards.length, // Number of cards reviewed
        questionsAnswered: completedCards.length,
        correctAnswers: completedCards.length, // Assuming reviewing means correct for flashcards
        studySetId: selectedStudySetId,
        studySetTitle: studySets.find((s) => s.id === selectedStudySetId)?.title,
        timestamp: new Date().toISOString(),
      })
    }
  }

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleFlipCard = () => {
    setIsFlipped(!isFlipped)
    if (!isFlipped && currentCard && !completedCards.includes(currentCard.id)) {
      setCompletedCards([...completedCards, currentCard.id])
    }
  }

  const handleRestart = () => {
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setCompletedCards([])
    setGameState("playing") // Go back to playing state
  }

  const handleStartSession = () => {
    if (selectedStudySetId) {
      const selectedSet = studySets.find((set) => set.id === selectedStudySetId)
      if (selectedSet && selectedSet.questionPairs && selectedSet.questionPairs.length > 0) {
        setFlashcards(
          selectedSet.questionPairs.map((pair, index) => ({
            id: `${selectedSet.id}-${index}`,
            question: pair.question,
            answer: pair.answer,
          })),
        )
        setCurrentCardIndex(0)
        setIsFlipped(false)
        setCompletedCards([])
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
              <h1 className="text-2xl font-bold tracking-tight">Flashcards</h1>
              {studySets.length === 0 ? (
                <div className="space-y-4">
                  <p className="text-gray-500">No study sets found. Create or upload study sets to use Flashcards.</p>
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
                          Start Flashcards
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

  if (gameState === "completed") {
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
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Flashcard Session Completed!</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold">You reviewed {completedCards.length} cards.</h2>
                  <p className="text-gray-500">Great job reviewing your study set!</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center gap-4">
                <Button onClick={handleRestart}>Review Again</Button>
                <Button variant="outline" onClick={() => setGameState("setup")}>
                  Choose Different Set
                </Button>
                <Link href="/dashboard">
                  <Button variant="outline">Back to Dashboard</Button>
                </Link>
              </CardFooter>
            </Card>
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
        <div className="mx-auto max-w-3xl">
          <div className="grid gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Flashcards</h1>
                <p className="text-gray-500">
                  {studySets.find((set) => set.id === selectedStudySetId)?.title || "Select a study set"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleRestart}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restart
                </Button>
                <Button variant="outline" size="sm" onClick={() => setGameState("setup")}>
                  Change Study Set
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-full max-w-xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500">
                    Card {currentCardIndex + 1} of {flashcards.length}
                  </p>
                  <p className="text-sm text-gray-500">
                    {completedCards.length} of {flashcards.length} reviewed
                  </p>
                </div>
                <Card
                  className={`w-full h-80 cursor-pointer transition-all duration-500 transform ${
                    isFlipped ? "rotate-y-180" : ""
                  }`}
                  onClick={handleFlipCard}
                >
                  <div className="relative w-full h-full">
                    <div
                      className={`absolute inset-0 backface-hidden transition-opacity duration-500 ${
                        isFlipped ? "opacity-0" : "opacity-100"
                      }`}
                    >
                      <CardContent className="flex items-center justify-center h-full p-6">
                        <div className="text-center">
                          <h2 className="text-xl font-semibold mb-4">Question</h2>
                          <p className="text-lg">{currentCard?.question}</p>
                          <p className="text-sm text-gray-500 mt-8">Click to reveal answer</p>
                        </div>
                      </CardContent>
                    </div>
                    <div
                      className={`absolute inset-0 backface-hidden transition-opacity duration-500 ${
                        isFlipped ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <CardContent className="flex items-center justify-center h-full p-6 transform rotate-y-180">
                        <div className="text-center">
                          <h2 className="text-xl font-semibold mb-4">Answer</h2>
                          <p className="text-lg">{currentCard?.answer}</p>
                        </div>
                      </CardContent>
                    </div>
                  </div>
                </Card>
                <div className="flex items-center justify-between mt-6">
                  <Button variant="outline" onClick={handlePrevCard} disabled={currentCardIndex === 0}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <Button onClick={handleNextCard}>
                    {currentCardIndex === flashcards.length - 1 ? "Finish Session" : "Next"}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
