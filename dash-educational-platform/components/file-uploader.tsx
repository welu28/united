"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Upload, X } from "lucide-react"

interface FileUploaderProps {
  onFileChange: (file: File | null) => void
  acceptedFileTypes?: string
  isUploading?: boolean
}

export function FileUploader({
  onFileChange,
  acceptedFileTypes = ".txt,.md,.pdf",
  isUploading = false,
}: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
    onFileChange(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0] || null
    if (file) {
      setSelectedFile(file)
      onFileChange(file)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    onFileChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            isDragging ? "border-primary bg-primary/5" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="rounded-full bg-gray-100 p-3">
              <Upload className="h-6 w-6 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium">Drag and drop your file here</h3>
            <p className="text-sm text-gray-500">
              Supports {acceptedFileTypes.replace(/\./g, "").replace(/,/g, ", ")} files
            </p>
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="mt-2">
              Browse Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFileTypes}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center space-x-3">
            <div className="rounded-full bg-gray-100 p-2">
              <FileText className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={handleRemoveFile} disabled={isUploading}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
