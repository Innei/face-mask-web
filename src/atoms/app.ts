import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import type { FaceDetectionConfig } from '~/lib/faceDetection'
import { DEFAULT_FACE_DETECTION_CONFIG } from '~/lib/faceDetection'
import type { FaceDetection } from '~/lib/imageProcessor'

// 图片相关状态
export const selectedImageAtom = atom<string | null>(null)
export const processedImageAtom = atom<string | null>(null)
export const isProcessingAtom = atom(false)
export const isDragOverAtom = atom(false)

// 人脸检测相关状态
export const faceDetectionsAtom = atomWithStorage<FaceDetection[]>(
  'faceDetections',
  [],
)
export const faceDetectionConfigAtom = atomWithStorage<FaceDetectionConfig>(
  'faceDetectionConfig',
  DEFAULT_FACE_DETECTION_CONFIG,
)

// Emoji 相关状态
export const selectedEmojisAtom = atomWithStorage<string[]>(
  'selectedEmojis',
  [],
)
export const customEmojiInputAtom = atomWithStorage('customEmojiInput', '')
export const customEmojisAtom = atomWithStorage<string[]>('customEmojis', [])
export const useRandomSelectionAtom = atomWithStorage(
  'useRandomSelection',
  true,
)

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
