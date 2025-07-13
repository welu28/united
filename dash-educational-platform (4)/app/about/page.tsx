import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Brain, Upload, Zap, Trophy, Users } from "lucide-react"

export default function AboutPage() {
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
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/about">
              About
            </Link>
          </nav>
          <div className="ml-4">
            <Link href="/sign-in">
              <Button variant="outline" className="mr-2 bg-transparent">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 py-6 px-4 md:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">About Noteify</h1>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                Transform your learning experience with AI-powered study tools designed for academic excellence.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <Upload className="h-8 w-8 mb-2" />
                  <CardTitle>Smart Upload</CardTitle>
                  <CardDescription>
                    Upload your notes in any format - text, markdown, or PDF - and our AI instantly processes them.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Brain className="h-8 w-8 mb-2" />
                  <CardTitle>AI Generation</CardTitle>
                  <CardDescription>
                    Our advanced AI analyzes your content and generates high-quality questions and answers
                    automatically.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <BookOpen className="h-8 w-8 mb-2" />
                  <CardTitle>Interactive Flashcards</CardTitle>
                  <CardDescription>
                    Study with dynamic flashcards that adapt to your learning pace and track your progress.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Zap className="h-8 w-8 mb-2" />
                  <CardTitle>NoteDown</CardTitle>
                  <CardDescription>
                    Experience Quiz Bowl-style learning with word-by-word reveals and competitive buzzer gameplay.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Trophy className="h-8 w-8 mb-2" />
                  <CardTitle>Competitive Trivia</CardTitle>
                  <CardDescription>
                    Challenge yourself with timed trivia games and track your performance across different subjects.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Users className="h-8 w-8 mb-2" />
                  <CardTitle>Social Learning</CardTitle>
                  <CardDescription>
                    Compete with friends, join study groups, and climb the leaderboards in various academic categories.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Ready to Transform Your Learning?</h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                Join thousands of students who are already using Noteify to improve their academic performance and Quiz
                Bowl skills.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/sign-up">
                  <Button size="lg">Get Started Free</Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg">
                    Try Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
