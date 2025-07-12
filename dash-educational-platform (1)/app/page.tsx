import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Brain, Trophy, Upload } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link className="flex items-center justify-center" href="/">
          <BookOpen className="h-6 w-6 mr-2" />
          <span className="font-bold text-xl">-Dash</span>
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
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-white to-gray-100">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Transform Your Notes into Interactive Learning
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl">
                    Upload your class notes and let our AI generate personalized flashcards, trivia questions, and QB
                    Reader challenges to accelerate your learning.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/dashboard">
                    <Button className="px-8">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button variant="outline" className="px-8 bg-transparent">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full h-[350px] bg-gray-200 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    Interactive Learning Platform Preview
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our AI-powered platform makes learning from your notes easier and more effective.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Upload className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Upload Your Notes</h3>
                  <p className="text-gray-500">
                    Upload your class notes in text, markdown, or PDF format. Our system processes them instantly.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Brain className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">AI Generates Q&A</h3>
                  <p className="text-gray-500">
                    Our AI analyzes your notes and generates high-quality question and answer pairs.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Trophy className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Learn & Compete</h3>
                  <p className="text-gray-500">
                    Practice with flashcards, take quizzes, play trivia games, and compete with others.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">QB Reader</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  A Competitive Trivia Game for Quiz Bowl Enthusiasts
                </p>
              </div>
              <div className="mx-auto max-w-3xl text-center">
                <p className="mb-8 text-gray-500">
                  QB Reader is a fast-paced, interactive trivia game inspired by the structure and excitement of Quiz
                  Bowl competitions. Designed for players who love academic knowledge, quick thinking, and buzzer-style
                  gameplay.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="bg-primary/10 p-2 rounded-full mr-3">
                        <span className="text-primary text-xl font-bold">🔄</span>
                      </div>
                      <h3 className="font-bold">Word-by-word reveal</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      Questions are revealed one word at a time, just like a real Quiz Bowl.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="bg-primary/10 p-2 rounded-full mr-3">
                        <span className="text-primary text-xl font-bold">⚡</span>
                      </div>
                      <h3 className="font-bold">Buzz-in system</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      Buzz in at any point if you know the answer, but be careful!
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="bg-primary/10 p-2 rounded-full mr-3">
                        <span className="text-primary text-xl font-bold">🧠</span>
                      </div>
                      <h3 className="font-bold">Wide range of topics</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      Questions span literature, science, history, arts, and more.
                    </p>
                  </div>
                </div>
                <div className="mt-8">
                  <Link href="/qb-reader">
                    <Button size="lg">Try QB Reader</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full border-t px-4 md:px-6">
        <p className="text-xs text-gray-500">© 2025 -Dash. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
