"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Plus, Trash2 } from "lucide-react"

interface QuestionPair {
  id: string
  question: string
  answer: string
}

interface StudySet {
  id: string
  title: string
  description: string
  questionPairs: Array<{ question: string; answer: string }>
  questionCount: number
  createdAt: string
  type?: string
  isFavorite?: boolean
}

export default function EditStudySetPage() {
  const params = useParams()
  const router = useRouter()
  const studySetId = params.id as string

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questionPairs, setQuestionPairs] = useState<QuestionPair[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (studySetId) {
      const savedSets = JSON.parse(localStorage.getItem("studySets") || "[]") as StudySet[]
      const setToEdit = savedSets.find((set) => set.id === studySetId)

      if (setToEdit) {
        setTitle(setToEdit.title)
        setDescription(setToEdit.description)
        const initialPairs: QuestionPair[] =
          setToEdit.questionPairs && setToEdit.questionPairs.length > 0
            ? setToEdit.questionPairs.map((pair, index) => ({
                id: `${studySetId}-${index}`,
                question: pair.question,
                answer: pair.answer,
              }))
            : [
                {
                  id: `${studySetId}-new`,
                  question: "",
                  answer: "",
                },
              ]

        setQuestionPairs(initialPairs)
      } else {
        // Redirect if study set not found
        alert("Study set not found.")
        router.push("/dashboard")
      }
      setIsLoading(false)
    }
  }, [studySetId, router])

  const addQuestionPair = () => {
    const newId = `${studySetId}-${Date.now()}` // Unique ID for new pairs
    setQuestionPairs([...questionPairs, { id: newId, question: "", answer: "" }])
  }

  const removeQuestionPair = (id: string) => {
    if (questionPairs.length > 1) {
      setQuestionPairs(questionPairs.filter((pair) => pair.id !== id))
    }
  }

  const updateQuestionPair = (id: string, field: "question" | "answer", value: string) => {
    setQuestionPairs(questionPairs.map((pair) => (pair.id === id ? { ...pair, [field]: value } : pair)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title) {
      alert("Please enter a title for your study set")
      return
    }

    const validPairs = questionPairs.filter((pair) => pair.question.trim() && pair.answer.trim())

    if (validPairs.length === 0) {
      alert("Please add at least one question and answer pair")
      return
    }

    setIsSaving(true)

    try {
      const existingSets = JSON.parse(localStorage.getItem("studySets") || "[]") as StudySet[]
      const updatedSets = existingSets.map((set) =>
        set.id === studySetId
          ? {
              ...set,
              title,
              description,
              questionPairs: validPairs.map((pair) => ({ question: pair.question, answer: pair.answer })),
              questionCount: validPairs.length,
              // Preserve original createdAt, type, isFavorite
            }
          : set,
      )
      localStorage.setItem("studySets", JSON.stringify(updatedSets))

      setIsSaving(false)
      router.push("/dashboard") // Redirect to dashboard after saving
    } catch (error) {
      console.error("Error saving study set:", error)
      alert("An error occurred while saving your study set. Please try again.")
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Loading study set...</p>
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
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Edit Study Set</h1>
              <p className="text-gray-500">Modify your question and answer pairs.</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Study Set Details</CardTitle>
                    <CardDescription>Update the title and description of your study set.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Biology 101 - Cell Structure"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Add a description of your study material"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Question & Answer Pairs</CardTitle>
                        <CardDescription>Edit your questions and answers.</CardDescription>
                      </div>
                      <Button type="button" onClick={addQuestionPair} variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Pair
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {questionPairs.map((pair, index) => (
                      <div key={pair.id} className="space-y-4 p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Question {index + 1}</h3>
                          {questionPairs.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeQuestionPair(pair.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor={`question-${pair.id}`}>Question</Label>
                            <Textarea
                              id={`question-${pair.id}`}
                              placeholder="Enter your question here..."
                              value={pair.question}
                              onChange={(e) => updateQuestionPair(pair.id, "question", e.target.value)}
                              className="min-h-[80px]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`answer-${pair.id}`}>Answer</Label>
                            <Textarea
                              id={`answer-${pair.id}`}
                              placeholder="Enter the answer here..."
                              value={pair.answer}
                              onChange={(e) => updateQuestionPair(pair.id, "answer", e.target.value)}
                              className="min-h-[80px]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" type="button" onClick={() => router.back()}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
