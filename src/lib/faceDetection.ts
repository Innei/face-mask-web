import * as faceapi from 'face-api.js'

export interface FaceDetection {
  x: number
  y: number
  width: number
  height: number
  confidence: number
}

export interface FaceDetectionConfig {
  inputSize: number
  scoreThreshold: number
  maxResults?: number
}

export const DEFAULT_FACE_DETECTION_CONFIG: FaceDetectionConfig = {
  inputSize: 416,
  scoreThreshold: 0.5,
  maxResults: 10,
}

export class FaceDetector {
  private isLoaded = false
  private config: FaceDetectionConfig = DEFAULT_FACE_DETECTION_CONFIG

  setConfig(config: Partial<FaceDetectionConfig>) {
    this.config = { ...this.config, ...config }
  }

  getConfig(): FaceDetectionConfig {
    return { ...this.config }
  }

  async loadModels() {
    if (this.isLoaded) return

    try {
      // 加载模型文件
      const MODEL_URL = '/models'

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ])

      this.isLoaded = true
      console.info('Face detection models loaded successfully')
    } catch (error) {
      console.error('Failed to load face detection models:', error)
      throw new Error('无法加载人脸检测模型')
    }
  }

  async detectFaces(imageElement: HTMLImageElement): Promise<FaceDetection[]> {
    if (!this.isLoaded) {
      await this.loadModels()
    }

    try {
      // 使用TinyFaceDetector进行人脸检测
      const detections = await faceapi.detectAllFaces(
        imageElement,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: this.config.inputSize,
          scoreThreshold: this.config.scoreThreshold,
        }),
      )

      // 转换为我们的格式，并限制结果数量
      const results = detections.map((detection) => ({
        x: detection.box.x,
        y: detection.box.y,
        width: detection.box.width,
        height: detection.box.height,
        confidence: detection.score,
      }))

      // 按置信度排序并限制数量
      const sortedResults = results.sort((a, b) => b.confidence - a.confidence)
      return this.config.maxResults
        ? sortedResults.slice(0, this.config.maxResults)
        : sortedResults
    } catch (error) {
      console.error('Face detection failed:', error)
      throw new Error('人脸检测失败')
    }
  }

  async detectFacesWithLandmarks(imageElement: HTMLImageElement) {
    if (!this.isLoaded) {
      await this.loadModels()
    }

    try {
      const detectionsWithLandmarks = await faceapi
        .detectAllFaces(
          imageElement,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: this.config.inputSize,
            scoreThreshold: this.config.scoreThreshold,
          }),
        )
        .withFaceLandmarks()

      const results = detectionsWithLandmarks.map((detection) => ({
        box: {
          x: detection.detection.box.x,
          y: detection.detection.box.y,
          width: detection.detection.box.width,
          height: detection.detection.box.height,
        },
        confidence: detection.detection.score,
        landmarks: detection.landmarks.positions,
      }))

      // 按置信度排序并限制数量
      const sortedResults = results.sort((a, b) => b.confidence - a.confidence)
      return this.config.maxResults
        ? sortedResults.slice(0, this.config.maxResults)
        : sortedResults
    } catch (error) {
      console.error('Face detection with landmarks failed:', error)
      throw new Error('人脸特征点检测失败')
    }
  }
}

// 创建单例实例
export const faceDetector = new FaceDetector()
