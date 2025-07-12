"use client"

import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

interface UploadButtonProps {
  onUpload: () => void
  isUploading?: boolean
}

export function UploadButton({ onUpload, isUploading = false }: UploadButtonProps) {
  return (
    <Button onClick={onUpload} disabled={isUploading}>
      {isUploading ? (
        <>Uploading...</>
      ) : (
        <>
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </>
      )}
    </Button>
  )
}
