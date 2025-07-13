"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
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

export default function CreatePage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questionPairs, setQuestionPairs] = useState<QuestionPair[]>([{ id: "1", question: "", answer: "" }])
  const [isCreating, setIsCreating] = useState(false)

  const addQuestionPair = () => {
    const newId = (questionPairs.length + 1).toString()
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

    setIsCreating(true)

    try {
      // Create a new study set
      const newStudySet = {
        id: Date.now().toString(),
        title,
        description,
        questionPairs: validPairs,
        questionCount: validPairs.length,
        createdAt: new Date().toISOString(), // Use ISO string for consistency
        type: "manual",
        isFavorite: false, // Default to not favorited
      }

      // Store in localStorage for demo purposes
      const existingSets = JSON.parse(localStorage.getItem("studySets") || "[]")
      existingSets.push(newStudySet)
      localStorage.setItem("studySets", JSON.stringify(existingSets))

      setIsCreating(false)

      // Redirect to the dashboard
      window.location.href = "/dashboard"
    } catch (error) {
      console.error("Error creating study set:", error)
      alert("An error occurred while creating your study set. Please try again.")
      setIsCreating(false)
    }
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
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Create Study Set Manually</h1>
              <p className="text-gray-500">Create your own question and answer pairs for studying.</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Study Set Details</CardTitle>
                    <CardDescription>
                      Give your study set a title and description to help you find it later.
                    </CardDescription>
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
                        <CardDescription>
                          Add your questions and answers. You can add as many as you need.
                        </CardDescription>
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
                    <Button variant="outline" type="button" onClick={() => window.history.back()}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? "Creating..." : "Create Study Set"}
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
