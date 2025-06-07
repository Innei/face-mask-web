import { useAtom, useSetAtom } from 'jotai'
import { useCallback, useRef } from 'react'
import { toast } from 'sonner'

import {
  faceDetectionsAtom,
  isDragOverAtom,
  processedImageAtom,
  selectedEmojisAtom,
  selectedImageAtom,
} from '~/atoms/app'
import { Button } from '~/components/ui/button'

export const ImageUpload = () => {
  const setSelectedImage = useSetAtom(selectedImageAtom)
  const [isDragOver, setIsDragOver] = useAtom(isDragOverAtom)
  const setProcessedImage = useSetAtom(processedImageAtom)
  const setFaceDetections = useSetAtom(faceDetectionsAtom)
  const setSelectedEmojis = useSetAtom(selectedEmojisAtom)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // 处理文件上传
  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast.error('请选择图片文件')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const { result } = e.target as FileReader
        setSelectedImage(result as string)
        setProcessedImage(null)
        setFaceDetections([])
        setSelectedEmojis([])
      }
      reader.readAsDataURL(file)
    },
    [setSelectedImage, setProcessedImage, setFaceDetections, setSelectedEmojis],
  )

  // 文件拖拽处理
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFileSelect(files[0])
      }
    },
    [handleFileSelect, setIsDragOver],
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(true)
    },
    [setIsDragOver],
  )

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
    },
    [setIsDragOver],
  )

  // 点击上传
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = e.target
      if (files && files.length > 0) {
        handleFileSelect(files[0])
      }
    },
    [handleFileSelect],
  )

  return (
    <div className="p-6 border border-border rounded-lg bg-card">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-muted-foreground'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="space-y-4">
          <div className="text-6xl">📸</div>
          <div>
            <p className="text-lg font-medium text-foreground mb-2">
              拖拽图片到这里或点击上传
            </p>
            <p className="text-sm text-muted-foreground">支持 JPG、PNG 格式</p>
          </div>
          <Button onClick={handleUploadClick}>选择图片</Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  )
}
