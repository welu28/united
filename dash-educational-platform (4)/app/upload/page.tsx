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
import { BookOpen, Upload } from "lucide-react"
import { FileUploader } from "@/components/file-uploader"
import { generateQuestionsAction } from "@/app/actions" // Import the server action

// Import PDF.js for client-side PDF parsing
import * as pdfjsLib from "pdfjs-dist/build/pdf.mjs"
import "pdfjs-dist/build/pdf.worker.min.mjs" // Ensure worker is loaded

export default function UploadPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title) {
      alert("Please enter a title for your study set")
      return
    }

    if (!content && !file) {
      alert("Please enter content or upload a file")
      return
    }

    setIsProcessing(true)

    try {
      let textContent = content

      // If a file was uploaded, read its content
      if (file) {
        if (file.type === "text/plain" || file.name.endsWith(".md") || file.name.endsWith(".txt")) {
          textContent = await file.text()
        } else if (file.type === "application/pdf") {
          try {
            const arrayBuffer = await file.arrayBuffer()
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
            let fullText = ""
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i)
              const textContent = await page.getTextContent()
              fullText += textContent.items.map((item: any) => item.str).join(" ") + "\n"
            }
            textContent = fullText
          } catch (pdfError) {
            console.error("Error processing PDF:", pdfError)
            alert("Failed to process PDF. Please ensure it's a valid PDF file and try again.")
            setIsProcessing(false)
            return
          }
        } else {
          alert("Unsupported file type. Please upload a .txt, .md, or .pdf file.")
          setIsProcessing(false)
          return
        }
      }

      if (!textContent.trim()) {
        alert("No content found to generate questions from. Please provide text or upload a valid file.")
        setIsProcessing(false)
        return
      }

      // Call the server action to generate questions with sourceType 'text'
      const generatedQuestions = await generateQuestionsAction(textContent, "text")

      if (generatedQuestions.length === 0) {
        alert("AI could not generate questions from the provided text. Please try with different content.")
        setIsProcessing(false)
        return
      }

      // Create a new study set
      const newStudySet = {
        id: Date.now().toString(),
        title,
        description,
        questionPairs: generatedQuestions.map((qa) => ({ question: qa.question, answer: qa.answer })),
        questionCount: generatedQuestions.length,
        createdAt: new Date().toISOString(),
        type: "ai-generated",
        isFavorite: false, // Default to not favorited
      }

      // Store in localStorage for demo purposes
      const existingSets = JSON.parse(localStorage.getItem("studySets") || "[]")
      existingSets.push(newStudySet)
      localStorage.setItem("studySets", JSON.stringify(existingSets))

      setIsProcessing(false)

      // Redirect to the dashboard
      window.location.href = "/dashboard"
    } catch (error) {
      console.error("Error processing upload:", error)
      alert("An error occurred while processing your upload. Please try again.")
      setIsProcessing(false)
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
        <div className="mx-auto max-w-2xl">
          <div className="grid gap-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Upload Study Material</h1>
              <p className="text-gray-500">Upload your notes and our AI will generate questions and answers for you.</p>
            </div>
            <form onSubmit={handleSubmit}>
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
                <CardHeader>
                  <CardTitle>Content</CardTitle>
                  <CardDescription>Upload a file or paste your notes directly.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="upload" className="w-full">
                    <TabsList className="w-full">
                      <TabsTrigger value="upload" className="flex-1">
                        Upload File
                      </TabsTrigger>
                      <TabsTrigger value="paste" className="flex-1">
                        Paste Text
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="upload" className="mt-4">
                      <FileUploader
                        onFileChange={handleFileChange}
                        acceptedFileTypes=".txt,.md,.pdf"
                        isUploading={isUploading}
                      />
                    </TabsContent>
                    <TabsContent value="paste" className="mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="content">Paste your notes</Label>
                        <Textarea
                          id="content"
                          placeholder="Paste your notes here..."
                          className="min-h-[200px]"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button" onClick={() => window.history.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isProcessing}>
                    {isProcessing ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload & Generate
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
