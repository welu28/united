"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Plus, Trash2, Brain } from "lucide-react" // Added Brain icon
import { generateQuestionsAction } from "@/app/actions" // Import the server action

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
  const [aiTopic, setAiTopic] = useState("") // New state for AI topic input
  const [isGeneratingAi, setIsGeneratingAi] = useState(false) // New state for AI generation loading

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

  const handleManualSubmit = async (e: React.FormEvent) => {
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

  const handleAiGenerate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title) {
      alert("Please enter a title for your study set")
      return
    }

    if (!aiTopic.trim()) {
      alert("Please enter a topic to generate questions.")
      return
    }

    setIsGeneratingAi(true)

    try {
      const generatedQuestions = await generateQuestionsAction(aiTopic, "topic")

      if (generatedQuestions.length === 0) {
        alert(
          "AI could not generate questions for the provided topic. Please try a different topic or be more specific.",
        )
        setIsGeneratingAi(false)
        return
      }

      // Create a new study set
      const newStudySet = {
        id: Date.now().toString(),
        title,
        description: description || `AI-generated questions about ${aiTopic}`,
        questionPairs: generatedQuestions.map((qa) => ({ question: qa.question, answer: qa.answer })),
        questionCount: generatedQuestions.length,
        createdAt: new Date().toISOString(),
        type: "ai-generated",
        isFavorite: false,
      }

      // Store in localStorage for demo purposes
      const existingSets = JSON.parse(localStorage.getItem("studySets") || "[]")
      existingSets.push(newStudySet)
      localStorage.setItem("studySets", JSON.stringify(existingSets))

      setIsGeneratingAi(false)
      window.location.href = "/dashboard"
    } catch (error) {
      console.error("Error generating AI questions:", error)
      alert("An error occurred while generating questions. Please try again.")
      setIsGeneratingAi(false)
    }
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
              <h1 className="text-2xl font-bold tracking-tight">Create Study Set</h1>
              <p className="text-gray-500">Create your own question and answer pairs or generate with AI.</p>
            </div>

            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="manual" className="flex-1">
                  Manual Entry
                </TabsTrigger>
                <TabsTrigger value="ai-generate" className="flex-1">
                  AI Generate
                </TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="mt-4">
                <form onSubmit={handleManualSubmit}>
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
              </TabsContent>

              <TabsContent value="ai-generate" className="mt-4">
                <form onSubmit={handleAiGenerate}>
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>AI Generate Study Set</CardTitle>
                        <CardDescription>
                          Enter a topic and our AI will generate questions and answers for you.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="ai-title">Title</Label>
                          <Input
                            id="ai-title"
                            placeholder="e.g., Introduction to Quantum Physics"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ai-description">Description (Optional)</Label>
                          <Textarea
                            id="ai-description"
                            placeholder="Add a description for your AI-generated study material"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ai-topic">Topic</Label>
                          <Input
                            id="ai-topic"
                            placeholder="e.g., The causes of World War I"
                            value={aiTopic}
                            onChange={(e) => setAiTopic(e.target.value)}
                            required
                          />
                          <p className="text-sm text-gray-500">
                            Be specific for better results (e.g., "Key concepts of calculus" instead of "Math").
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" type="button" onClick={() => window.history.back()}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isGeneratingAi}>
                          {isGeneratingAi ? (
                            <>Generating...</>
                          ) : (
                            <>
                              <Brain className="mr-2 h-4 w-4" />
                              Generate Questions
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
