import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useRef } from 'react'
import { toast } from 'sonner'

import {
  canProcessImageAtom,
  customEmojisAtom,
  faceDetectionConfigAtom,
  faceDetectionsAtom,
  isProcessingAtom,
  processedImageAtom,
  selectedEmojisAtom,
  selectedImageAtom,
  useRandomSelectionAtom,
} from '~/atoms/app'
import { Button } from '~/components/ui/button'
import { DEFAULT_EMOJI_OPTIONS, getRandomEmojis } from '~/lib/emojiUtils'
import { faceDetector } from '~/lib/faceDetection'
import { imageProcessor } from '~/lib/imageProcessor'

export const ImagePreview = () => {
  const selectedImage = useAtomValue(selectedImageAtom)
  const [processedImage, setProcessedImage] = useAtom(processedImageAtom)
  const [faceDetections, setFaceDetections] = useAtom(faceDetectionsAtom)
  const [selectedEmojis, setSelectedEmojis] = useAtom(selectedEmojisAtom)
  const [isProcessing, setIsProcessing] = useAtom(isProcessingAtom)
  const faceDetectionConfig = useAtomValue(faceDetectionConfigAtom)
  const useRandomSelection = useAtomValue(useRandomSelectionAtom)
  const customEmojis = useAtomValue(customEmojisAtom)
  const canProcessImage = useAtomValue(canProcessImageAtom)

  const imageRef = useRef<HTMLImageElement>(null)

  // 获取当前可用的 emoji 列表
  const getAvailableEmojis = useCallback(() => {
    return customEmojis.length > 0 ? customEmojis : DEFAULT_EMOJI_OPTIONS
  }, [customEmojis])

  // 人脸检测
  const detectFaces = useCallback(async () => {
    if (!selectedImage || !imageRef.current) return

    setIsProcessing(true)

    try {
      // 更新人脸检测配置
      faceDetector.setConfig(faceDetectionConfig)

      // 使用图像处理器进行人脸检测
      const detections = await faceDetector.detectFaces(imageRef.current)

      setFaceDetections(detections)

      if (detections.length > 0) {
        toast.success(`检测到 ${detections.length} 个人脸`)

        // 根据检测到的人脸数量自动选择 emoji
        if (useRandomSelection) {
          const availableEmojis = getAvailableEmojis()
          const randomEmojis = getRandomEmojis(
            availableEmojis,
            detections.length,
          )
          setSelectedEmojis(randomEmojis)
        }
      } else {
        toast.info('未检测到人脸，请尝试其他图片')
        setSelectedEmojis([])
      }
    } catch (error) {
      console.error('人脸检测失败:', error)
      toast.error('人脸检测失败，请重试')
      setFaceDetections([])
      setSelectedEmojis([])
    } finally {
      setIsProcessing(false)
    }
  }, [
    selectedImage,
    faceDetectionConfig,
    useRandomSelection,
    getAvailableEmojis,
    setIsProcessing,
    setFaceDetections,
    setSelectedEmojis,
  ])

  // 处理图片并替换人脸为Emoji
  const processImage = useCallback(async () => {
    if (
      !imageRef.current ||
      faceDetections.length === 0 ||
      selectedEmojis.length === 0
    ) {
      return
    }

    setIsProcessing(true)

    try {
      // 使用图像处理器处理图片
      const processedDataUrl = await imageProcessor.processImageWithEmojis(
        imageRef.current,
        faceDetections,
        selectedEmojis,
      )

      setProcessedImage(processedDataUrl)
      toast.success('图片处理完成！')
    } catch (error) {
      console.error('图片处理失败:', error)
      toast.error('图片处理失败，请重试')
    } finally {
      setIsProcessing(false)
    }
  }, [faceDetections, selectedEmojis, setIsProcessing, setProcessedImage])

  // 下载处理后的图片
  const downloadImage = useCallback(() => {
    if (!processedImage) return

    const link = document.createElement('a')
    link.href = processedImage
    link.download = `emoji-face-${Date.now()}.jpeg`
    document.body.append(link)
    link.click()
    link.remove()

    toast.success('图片已下载')
  }, [processedImage])

  if (!selectedImage) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* 图片预览和处理区域 */}
      <div className="p-6 border border-border rounded-lg bg-card">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 原图预览 */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">原图</h3>
            <div className="relative">
              <img
                ref={imageRef}
                src={selectedImage}
                alt="原图"
                className="w-full h-auto rounded-lg border border-border"
                onLoad={() => {
                  // 图片加载完成后自动检测人脸
                  if (faceDetections.length === 0) {
                    detectFaces()
                  }
                }}
              />

              {/* 人脸检测框 */}
              {faceDetections.map((face, index) => (
                <div
                  key={index}
                  className="absolute border-2 border-red-500 bg-red-500/20"
                  style={{
                    left: `${(face.x / imageRef.current!.naturalWidth) * 100}%`,
                    top: `${(face.y / imageRef.current!.naturalHeight) * 100}%`,
                    width: `${(face.width / imageRef.current!.naturalWidth) * 100}%`,
                    height: `${(face.height / imageRef.current!.naturalHeight) * 100}%`,
                  }}
                >
                  <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    人脸 {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 处理后图片预览 */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              处理结果
            </h3>
            {processedImage ? (
              <img
                src={processedImage}
                alt="处理结果"
                className="w-full h-auto rounded-lg border border-border"
              />
            ) : (
              <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center border border-border">
                <p className="text-muted-foreground">
                  处理后的图片将显示在这里
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="p-6 border border-border rounded-lg bg-card">
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            onClick={detectFaces}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isProcessing ? '检测中...' : '重新检测人脸'}
          </Button>

          <Button
            onClick={processImage}
            disabled={!canProcessImage}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isProcessing ? '处理中...' : '生成 Emoji 头像'}
          </Button>

          {processedImage && <Button onClick={downloadImage}>下载图片</Button>}
        </div>

        {faceDetections.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              检测到 {faceDetections.length} 个人脸，选择了{' '}
              {selectedEmojis.length} 个 Emoji
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
