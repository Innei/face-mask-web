import { atom } from 'jotai'

import type { FaceDetectionConfig } from '~/lib/faceDetection'
import { DEFAULT_FACE_DETECTION_CONFIG } from '~/lib/faceDetection'
import type { FaceDetection } from '~/lib/imageProcessor'

// 图片相关状态
export const selectedImageAtom = atom<string | null>(null)
export const processedImageAtom = atom<string | null>(null)
export const isProcessingAtom = atom(false)
export const isDragOverAtom = atom(false)

// 人脸检测相关状态
export const faceDetectionsAtom = atom<FaceDetection[]>([])
export const faceDetectionConfigAtom = atom<FaceDetectionConfig>(
  DEFAULT_FACE_DETECTION_CONFIG,
)

// Emoji 相关状态
export const selectedEmojisAtom = atom<string[]>([])
export const customEmojiInputAtom = atom('')
export const customEmojisAtom = atom<string[]>([])
export const useRandomSelectionAtom = atom(true)

// 派生状态
export const hasSelectedImageAtom = atom(
  (get) => get(selectedImageAtom) !== null,
)
export const hasFaceDetectionsAtom = atom(
  (get) => get(faceDetectionsAtom).length > 0,
)
export const canProcessImageAtom = atom((get) => {
  const faceDetections = get(faceDetectionsAtom)
  const selectedEmojis = get(selectedEmojisAtom)
  const isProcessing = get(isProcessingAtom)
  return faceDetections.length > 0 && selectedEmojis.length > 0 && !isProcessing
})
