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
  isFavorite?: boolean
  questionPairs?: Array<{ question: string; answer: string }> // Added questionPairs for mock data
}

export default function DashboardPage() {
  const [studySets, setStudySets] = useState<StudySet[]>([])

  // Mock data for demonstration if no saved sets
  const mockSets: StudySet[] = [
    {
      id: "1",
      title: "Biology 101 - Cell Structure",
      description: "Notes on cell structure and function",
      questionCount: 3,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      isFavorite: false,
      questionPairs: [
        { question: "What is the powerhouse of the cell?", answer: "Mitochondria" },
        { question: "What are the four nucleotides found in DNA?", answer: "Adenine, Guanine, Cytosine, Thymine" },
        {
          question: "What is the process by which plants convert light energy into chemical energy?",
          answer: "Photosynthesis",
        },
      ],
    },
    {
      id: "2",
      title: "History - World War II",
      description: "Key events and figures from WWII",
      questionCount: 2,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
      isFavorite: true, // Example favorited mock set
      questionPairs: [
        { question: "When did World War II begin?", answer: "September 1, 1939" },
        {
          question: "Who was the Prime Minister of the United Kingdom during most of WWII?",
          answer: "Winston Churchill",
        },
      ],
    },
    {
      id: "3",
      title: "Chemistry - Periodic Table",
      description: "Elements and their properties",
      questionCount: 8, // Updated question count
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
      isFavorite: false,
      questionPairs: [
        { question: "What is the chemical symbol for Gold?", answer: "Au" },
        { question: "Which element has the atomic number 1?", answer: "Hydrogen" },
        { question: "What is the most abundant gas in Earth's atmosphere?", answer: "Nitrogen" },
        {
          question: "Explain the concept of electronegativity and its trend across the periodic table.",
          answer:
            "Electronegativity is a measure of an atom's ability to attract electrons in a chemical bond. It generally increases across a period (left to right) and decreases down a group (top to bottom) on the periodic table.",
        },
        {
          question: "Describe the main difference between an ionic bond and a covalent bond.",
          answer:
            "An ionic bond involves the complete transfer of electrons between atoms, typically between a metal and a nonmetal, resulting in charged ions. A covalent bond involves the sharing of electrons between atoms, typically between two nonmetals.",
        },
        {
          question: "What is an isotope? Provide an example.",
          answer:
            "An isotope is an atom of an element that has the same number of protons but a different number of neutrons, leading to a different mass number. For example, Carbon-12 and Carbon-14 are isotopes of carbon; both have 6 protons, but Carbon-12 has 6 neutrons while Carbon-14 has 8 neutrons.",
        },
        {
          question: "Define pH and explain what a pH of 7 signifies.",
          answer:
            "pH is a measure of the acidity or alkalinity of an aqueous solution. It is defined as the negative logarithm (base 10) of the hydrogen ion concentration. A pH of 7 signifies a neutral solution, meaning it is neither acidic nor basic.",
        },
        {
          question: "What is the Pauli Exclusion Principle?",
          answer:
            "The Pauli Exclusion Principle states that no two electrons in an atom can have the same set of four quantum numbers (n, l, ml, ms). This means that an atomic orbital can hold a maximum of two electrons, and these two electrons must have opposite spins.",
        },
      ],
    },
  ]

  useEffect(() => {
    // Load study sets from localStorage
    const savedSets = JSON.parse(localStorage.getItem("studySets") || "[]")
    if (savedSets.length === 0) {
      // If no sets in localStorage, initialize with mock data and save it
      setStudySets(mockSets)
      localStorage.setItem("studySets", JSON.stringify(mockSets))
    } else {
      setStudySets(savedSets)
    }
  }, [])

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

  const favoriteSets = studySets.filter((set) => set.isFavorite)

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
                {studySets.map((set) => (
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
                {studySets.length > 0 ? (
                  studySets.map((set) => (
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
