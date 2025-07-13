"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Trophy, Target, Clock } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface ActivityItem {
  activity: string
  time: string
  score?: number
  type: "flashcard" | "trivia" | "notedown" | "create" | "upload" | "profile"
}

interface UserStats {
  totalStudySets: number
  totalQuestions: number
  averageScore: number
  timeSpent: string
  streak: number
  notedownScore: number // Renamed from qbReaderScore
  gamesPlayed: number
  questionsAnswered: number
  correctAnswers: number
}

export default function ProfilePage() {
  const [name, setName] = useState("John Doe")
  const [email, setEmail] = useState("john.doe@example.com")
  const [isEditing, setIsEditing] = useState(false)
  const [stats, setStats] = useState<UserStats>({
    totalStudySets: 0,
    totalQuestions: 0,
    averageScore: 0,
    timeSpent: "0h 0m",
    streak: 0,
    notedownScore: 1000, // Renamed from qbReaderScore
    gamesPlayed: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
  })
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])

  useEffect(() => {
    // Load actual user data
    loadUserStats()
    loadRecentActivity()

    // Load user profile from localStorage
    const savedProfile = localStorage.getItem("userProfile")
    if (savedProfile) {
      const profile = JSON.parse(savedProfile)
      setName(profile.name || "John Doe")
      setEmail(profile.email || "john.doe@example.com")
    }
  }, [])

  const loadUserStats = () => {
    // Get study sets
    const studySets = JSON.parse(localStorage.getItem("studySets") || "[]")

    // Get game history
    const gameHistory = JSON.parse(localStorage.getItem("gameHistory") || "[]")

    // Get activity log
    const activityLog = JSON.parse(localStorage.getItem("activityLog") || "[]")

    // Calculate total questions from study sets
    const totalQuestions = studySets.reduce((total: number, set: any) => {
      return total + (set.questionCount || 0)
    }, 0)

    // Calculate stats from game history
    const gamesPlayed = gameHistory.length
    const totalScore = gameHistory.reduce((sum: number, game: any) => sum + (game.score || 0), 0)
    const averageScore = gamesPlayed > 0 ? Math.round(totalScore / gamesPlayed) : 0

    // Calculate questions answered and correct answers
    const questionsAnswered = gameHistory.reduce((total: number, game: any) => total + (game.questionsAnswered || 0), 0)
    const correctAnswers = gameHistory.reduce((total: number, game: any) => total + (game.correctAnswers || 0), 0)

    // Calculate time spent (mock calculation based on activity)
    const hoursSpent = Math.floor(activityLog.length * 0.5) // Rough estimate
    const minutesSpent = (activityLog.length * 30) % 60

    // Calculate streak (days with activity in the last week)
    const today = new Date()
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const recentActivities = activityLog.filter((activity: any) => {
      const activityDate = new Date(activity.timestamp)
      return activityDate >= lastWeek
    })

    // Simple streak calculation - unique days with activity
    const uniqueDays = new Set(
      recentActivities.map((activity: any) => {
        return new Date(activity.timestamp).toDateString()
      }),
    )

    // Get NoteDown ELO from localStorage
    const savedElo = localStorage.getItem("userElo")
    const currentElo = savedElo ? Number.parseInt(savedElo, 10) : 1000 // Default if not found

    setStats({
      totalStudySets: studySets.length,
      totalQuestions,
      averageScore,
      timeSpent: `${hoursSpent}h ${minutesSpent}m`,
      streak: uniqueDays.size,
      notedownScore: currentElo, // Use the directly stored ELO
      gamesPlayed,
      questionsAnswered,
      correctAnswers,
    })
  }

  const loadRecentActivity = () => {
    const activityLog = JSON.parse(localStorage.getItem("activityLog") || "[]")

    // Sort by timestamp (most recent first) and take last 10
    const sortedActivity = activityLog
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
      .map((activity: any) => ({
        activity: activity.description,
        time: formatDate(activity.timestamp), // Use the new formatDate utility
        score: activity.score,
        type: activity.type,
      }))

    setRecentActivity(
      sortedActivity.length > 0
        ? sortedActivity
        : [
            {
              activity: "Welcome to Noteify! Start creating study sets to see your activity here.",
              time: "now",
              type: "create" as const,
            },
          ],
    )
  }

  const handleSaveProfile = () => {
    // Save profile to localStorage
    const profile = { name, email }
    localStorage.setItem("userProfile", JSON.stringify(profile))

    // Log this activity
    const activityLog = JSON.parse(localStorage.getItem("activityLog") || "[]")
    activityLog.push({
      timestamp: new Date().toISOString(),
      description: "Updated profile information",
      type: "profile",
    })
    localStorage.setItem("activityLog", JSON.stringify(activityLog))

    setIsEditing(false)
    loadRecentActivity() // Refresh activity
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
              <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
              <p className="text-gray-500">Manage your account and view your learning progress.</p>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full md:w-auto">
                <TabsTrigger value="overview" className="flex-1 md:flex-none">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex-1 md:flex-none">
                  Settings
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex-1 md:flex-none">
                  Activity
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Study Sets</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.totalStudySets}</div>
                        <p className="text-xs text-muted-foreground">Total created</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Questions</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.questionsAnswered}</div>
                        <p className="text-xs text-muted-foreground">Total answered</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {stats.questionsAnswered > 0
                            ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100)
                            : 0}
                          %
                        </div>
                        <p className="text-xs text-muted-foreground">Accuracy rate</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Games Played</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.gamesPlayed}</div>
                        <p className="text-xs text-muted-foreground">Total sessions</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Learning Streak</CardTitle>
                        <CardDescription>Days active this week</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-green-600">{stats.streak} days</div>
                        <p className="text-sm text-gray-500 mt-2">
                          {stats.streak === 0 ? "Start studying to build your streak!" : "Keep up the great work!"}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>NoteDown Score</CardTitle>
                        <CardDescription>Your competitive ranking</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-blue-600">{stats.notedownScore}</div>
                        <p className="text-sm text-gray-500 mt-2">
                          {stats.notedownScore >= 1200
                            ? "Expert level!"
                            : stats.notedownScore >= 1000
                              ? "Intermediate level"
                              : "Beginner level"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {stats.questionsAnswered > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Performance Summary</CardTitle>
                        <CardDescription>Your learning statistics</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-green-600">{stats.correctAnswers}</div>
                            <p className="text-sm text-gray-500">Correct</p>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-red-600">
                              {stats.questionsAnswered - stats.correctAnswers}
                            </div>
                            <p className="text-sm text-gray-500">Incorrect</p>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-600">{stats.totalQuestions}</div>
                            <p className="text-sm text-gray-500">Available</p>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-purple-600">
                              {stats.totalQuestions > 0
                                ? Math.round((stats.questionsAnswered / stats.totalQuestions) * 100)
                                : 0}
                              %
                            </div>
                            <p className="text-sm text-gray-500">Progress</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Update your personal information and preferences.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={!isEditing} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="flex gap-2">
                      {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                      ) : (
                        <>
                          <Button onClick={handleSaveProfile}>Save Changes</Button>
                          <Button variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your learning activity and progress.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                item.type === "notedown"
                                  ? "bg-blue-500"
                                  : item.type === "trivia"
                                    ? "bg-green-500"
                                    : item.type === "flashcard"
                                      ? "bg-purple-500"
                                      : item.type === "create"
                                        ? "bg-orange-500"
                                        : "bg-gray-500"
                              }`}
                            />
                            <span className="text-sm">{item.activity}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.score && (
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">Score: {item.score}</span>
                            )}
                            <span className="text-xs text-gray-500">{item.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
