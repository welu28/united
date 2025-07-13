"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, FileText, Heart, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/utils"

interface StudySetProps {
  studySet: {
    id: string
    title: string
    description: string
    questionCount: number
    createdAt: string
    isFavorite?: boolean
  }
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
}

export function StudySetCard({ studySet, onDelete, onToggleFavorite }: StudySetProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="line-clamp-1">{studySet.title}</CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onToggleFavorite(studySet.id)}
              aria-label={studySet.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`h-4 w-4 ${studySet.isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/edit/${studySet.id}`}>Edit</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem>Share</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={() => onDelete(studySet.id)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2">{studySet.description}</p>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center text-sm text-gray-500">
          <FileText className="mr-1 h-4 w-4" />
          {studySet.questionCount} questions
        </div>
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <span>Created {formatDate(studySet.createdAt)}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex gap-2 w-full">
          <Link href={`/flashcards?set=${studySet.id}`} className="flex-1">
            <Button variant="outline" className="w-full bg-transparent" size="sm">
              <BookOpen className="mr-2 h-4 w-4" />
              Flashcards
            </Button>
          </Link>
          <Link href={`/trivia?set=${studySet.id}`} className="flex-1">
            <Button variant="outline" className="w-full bg-transparent" size="sm">
              Trivia
            </Button>
          </Link>
          <Link href={`/notedown?set=${studySet.id}`} className="flex-1">
            <Button className="w-full" size="sm">
              NoteDown
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
