"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText, Plus, Upload, Heart } from "lucide-react"
import { StudySetCard } from "@/components/study-set-card"

interface StudySet {
  id: string
  title: string
  description: string
  questionCount: number
  createdAt: string
  isFavorite?: boolean // Ensure this is part of the interface
}

export default function DashboardPage() {
  const [studySets, setStudySets] = useState<StudySet[]>([])

  useEffect(() => {
    // Load study sets from localStorage
    const savedSets = JSON.parse(localStorage.getItem("studySets") || "[]")
    setStudySets(savedSets)
  }, [])

  // Mock data for demonstration if no saved sets
  const mockSets: StudySet[] = [
    {
      id: "1",
      title: "Biology 101 - Cell Structure",
      description: "Notes on cell structure and function",
      questionCount: 24,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      isFavorite: false,
    },
    {
      id: "2",
      title: "History - World War II",
      description: "Key events and figures from WWII",
      questionCount: 32,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
      isFavorite: true, // Example favorited mock set
    },
    {
      id: "3",
      title: "Chemistry - Periodic Table",
      description: "Elements and their properties",
      questionCount: 18,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
      isFavorite: false,
    },
  ]

  const displaySets = studySets.length > 0 ? studySets : mockSets

  const handleDeleteStudySet = (idToDelete: string) => {
    const updatedSets = studySets.filter((set) => set.id !== idToDelete)
    setStudySets(updatedSets)
    localStorage.setItem("studySets", JSON.stringify(updatedSets))
  }

  const handleToggleFavorite = (idToToggle: string) => {
    const updatedSets = studySets.map((set) => (set.id === idToToggle ? { ...set, isFavorite: !set.isFavorite } : set))
    setStudySets(updatedSets)
    localStorage.setItem("studySets", JSON.stringify(updatedSets))
  }

  const favoriteSets = displaySets.filter((set) => set.isFavorite)

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
        <div className="grid gap-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
            <div className="grid gap-1">
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-gray-500">Manage your study sets and learning activities.</p>
            </div>
            <div className="ml-auto flex flex-col sm:flex-row gap-2">
              <Link href="/upload">
                <Button className="w-full sm:w-auto">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Notes
                </Button>
              </Link>
              <Link href="/create">
                <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Manually
                </Button>
              </Link>
            </div>
          </div>
          <Tabs defaultValue="recent" className="w-full">
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="recent" className="flex-1 md:flex-none">
                Recent
              </TabsTrigger>
              <TabsTrigger value="all" className="flex-1 md:flex-none">
                All Sets
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex-1 md:flex-none">
                Favorites
              </TabsTrigger>
            </TabsList>
            <TabsContent value="recent" className="mt-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {displaySets.map((set) => (
                  <StudySetCard
                    key={set.id}
                    studySet={set}
                    onDelete={handleDeleteStudySet}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="all" className="mt-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {displaySets.length > 0 ? (
                  displaySets.map((set) => (
                    <StudySetCard
                      key={set.id}
                      studySet={set}
                      onDelete={handleDeleteStudySet}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))
                ) : (
                  <Card className="flex h-60 flex-col items-center justify-center">
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      <FileText className="h-10 w-10 text-gray-400 mb-4" />
                      <p className="text-center text-sm text-gray-500">No study sets found.</p>
                      <p className="text-center text-sm text-gray-500">Upload your notes to get started.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            <TabsContent value="favorites" className="mt-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {favoriteSets.length > 0 ? (
                  favoriteSets.map((set) => (
                    <StudySetCard
                      key={set.id}
                      studySet={set}
                      onDelete={handleDeleteStudySet}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))
                ) : (
                  <Card className="flex h-60 flex-col items-center justify-center">
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      <Heart className="h-10 w-10 text-gray-400 mb-4" />
                      <p className="text-center text-sm text-gray-500">No favorite study sets yet.</p>
                      <p className="text-center text-sm text-gray-500">
                        Click the heart icon on a study set to add it to your favorites!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Recent Activity</h2>
              <Link href="/activity" className="text-sm font-medium text-primary hover:underline">
                View All
              </Link>
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500">No recent activity.</p>
                  <p className="text-sm text-gray-500">Start studying to track your progress!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
