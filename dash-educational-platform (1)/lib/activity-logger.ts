interface GameResult {
  type: "qb-reader" | "trivia" | "flashcard"
  score: number
  questionsAnswered: number
  correctAnswers: number
  studySetId?: string
  studySetTitle?: string
  timestamp: string
}

interface ActivityItem {
  timestamp: string
  description: string
  type: "qb-reader" | "trivia" | "flashcard" | "create" | "upload" | "profile"
  score?: number
  studySetId?: string
}

export function logGameResult(result: GameResult) {
  // Log to game history
  const gameHistory = JSON.parse(localStorage.getItem("gameHistory") || "[]")
  gameHistory.push(result)
  localStorage.setItem("gameHistory", JSON.stringify(gameHistory))

  // Log to activity feed
  const activityLog = JSON.parse(localStorage.getItem("activityLog") || "[]")
  const accuracy =
    result.questionsAnswered > 0 ? Math.round((result.correctAnswers / result.questionsAnswered) * 100) : 0

  let description = ""
  switch (result.type) {
    case "qb-reader":
      description = `Completed QB Reader session - ${accuracy}% accuracy (${result.correctAnswers}/${result.questionsAnswered})`
      break
    case "trivia":
      description = `Finished trivia game - Score: ${result.score} (${result.correctAnswers}/${result.questionsAnswered})`
      break
    case "flashcard":
      description = `Studied flashcards - Reviewed ${result.questionsAnswered} cards`
      break
  }

  if (result.studySetTitle) {
    description += ` - ${result.studySetTitle}`
  }

  activityLog.push({
    timestamp: result.timestamp,
    description,
    type: result.type,
    score: result.score,
    studySetId: result.studySetId,
  })

  localStorage.setItem("activityLog", JSON.stringify(activityLog))
}

export function logActivity(activity: Omit<ActivityItem, "timestamp">) {
  const activityLog = JSON.parse(localStorage.getItem("activityLog") || "[]")
  activityLog.push({
    ...activity,
    timestamp: new Date().toISOString(),
  })
  localStorage.setItem("activityLog", JSON.stringify(activityLog))
}
