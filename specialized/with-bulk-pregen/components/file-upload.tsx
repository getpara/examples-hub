"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Cloud, AlertCircle, FileText, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFileUpload: (file: File) => void
  className?: string
}

export function FileUpload({ onFileUpload, className }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const validateFile = (file: File): boolean => {
    // Check if file is CSV
    if (!file.name.endsWith(".csv")) {
      setError("Only CSV files are allowed")
      return false
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit")
      return false
    }

    return true
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setError(null)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]

      if (validateFile(droppedFile)) {
        setFile(droppedFile)
        onFileUpload(droppedFile)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)

    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]

      if (validateFile(selectedFile)) {
        setFile(selectedFile)
        onFileUpload(selectedFile)
      }
    }
  }

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />

      {!file ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-4",
            isDragging ? "border-primary bg-primary/5" : "border-gray-300",
            "transition-colors duration-200",
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="rounded-full bg-gray-100 p-3">
            <Cloud className="h-6 w-6 text-gray-500" />
          </div>

          <div className="text-center">
            <p className="text-lg font-medium">Choose a file or drag & drop it here</p>
            <p className="text-sm text-gray-500 mt-1">CSV files only, up to 5MB</p>
          </div>

          <Button type="button" onClick={handleBrowseClick} className="mt-2">
            Browse File
          </Button>

          {error && (
            <div className="flex items-center text-red-500 gap-1 mt-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRemoveFile}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
