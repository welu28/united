"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"

export default function FlashcardsPage() {
  // Mock data for demonstration
  const mockFlashcards = [
    {
      id: "1",
      question: "What is the powerhouse of the cell?",
      answer:
        "The mitochondria is the powerhouse of the cell. It generates most of the cell's supply of adenosine triphosphate (ATP), used as a source of chemical energy.",
    },
    {
      id: "2",
      question: "What are the four nucleotides found in DNA?",
      answer: "The four nucleotides found in DNA are adenine (A), guanine (G), cytosine (C), and thymine (T).",
    },
    {
      id: "3",
      question: "What is the process by which plants convert light energy into chemical energy?",
      answer:
        "Photosynthesis is the process by which plants convert light energy into chemical energy that can be used to fuel the organisms' activities.",
    },
  ]

  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [completedCards, setCompletedCards] = useState<string[]>([])

  const currentCard = mockFlashcards[currentCardIndex]

  const handleNextCard = () => {
    if (currentCardIndex < mockFlashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setIsFlipped(false)
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
    if (!isFlipped && !completedCards.includes(currentCard.id)) {
      setCompletedCards([...completedCards, currentCard.id])
    }
  }

  const handleRestart = () => {
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setCompletedCards([])
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
                <h1 className="text-2xl font-bold tracking-tight">Flashcards</h1>
                <p className="text-gray-500">Biology 101 - Cell Structure</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleRestart}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restart
                </Button>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-full max-w-xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500">
                    Card {currentCardIndex + 1} of {mockFlashcards.length}
                  </p>
                  <p className="text-sm text-gray-500">
                    {completedCards.length} of {mockFlashcards.length} reviewed
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
                          <p className="text-lg">{currentCard.question}</p>
                          <p className="text-sm text-gray-500 mt-8">Click to reveal answer</p>
                        </div>
                      </CardContent>
                    </div>
                    <div
                      className={`absolute inset-0 backface-hidden transition-opacity duration-500 ${
                        isFlipped ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <CardContent className="flex items-center justify-center h-full p-6">
                        <div className="text-center">
                          <h2 className="text-xl font-semibold mb-4">Answer</h2>
                          <p className="text-lg">{currentCard.answer}</p>
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
                  <Button onClick={handleNextCard} disabled={currentCardIndex === mockFlashcards.length - 1}>
                    Next
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
