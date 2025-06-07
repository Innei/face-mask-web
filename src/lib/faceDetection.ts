import * as faceapi from 'face-api.js'

export interface FaceDetection {
  x: number
  y: number
  width: number
  height: number
  confidence: number
}

// 模型类型枚举
export enum ModelType {
  TINY_FACE_DETECTOR = 'tiny',
  SSD_MOBILENET_V1 = 'ssd',
  MTCNN = 'mtcnn',
}

// 模型配置信息
export const MODEL_CONFIGS = {
  [ModelType.TINY_FACE_DETECTOR]: {
    name: 'TinyFaceDetector',
    description: '快速检测，适合实时处理',
    speed: '快',
    accuracy: '中等',
    defaultInputSize: 416,
    inputSizeOptions: [128, 160, 224, 320, 416, 512, 608],
  },
  [ModelType.SSD_MOBILENET_V1]: {
    name: 'SSD MobileNetV1',
    description: '平衡速度和精度，推荐使用',
    speed: '中等',
    accuracy: '高',
    defaultInputSize: 512,
    inputSizeOptions: [320, 416, 512, 608],
  },
  [ModelType.MTCNN]: {
    name: 'MTCNN',
    description: '最高精度，适合高质量检测',
    speed: '慢',
    accuracy: '最高',
    defaultInputSize: 0, // MTCNN 不使用 inputSize
    inputSizeOptions: [],
  },
} as const

export interface FaceDetectionConfig {
  modelType: ModelType
  inputSize: number
  scoreThreshold: number
  maxResults?: number
}

export const DEFAULT_FACE_DETECTION_CONFIG: FaceDetectionConfig = {
  modelType: ModelType.SSD_MOBILENET_V1, // 默认使用高精度模型
  inputSize: 512,
  scoreThreshold: 0.5,
  maxResults: 10,
}

export class FaceDetector {
  private loadedModels = new Set<ModelType>()
  private config: FaceDetectionConfig = DEFAULT_FACE_DETECTION_CONFIG

  setConfig(config: Partial<FaceDetectionConfig>) {
    const newConfig = { ...this.config, ...config }

    // 如果模型类型改变，更新默认输入尺寸
    if (config.modelType && config.modelType !== this.config.modelType) {
      const modelConfig = MODEL_CONFIGS[config.modelType]
      if (modelConfig.defaultInputSize > 0) {
        newConfig.inputSize = modelConfig.defaultInputSize
      }
    }

    this.config = newConfig
  }

  getConfig(): FaceDetectionConfig {
    return { ...this.config }
  }

  async loadModels(modelType?: ModelType) {
    const targetModel = modelType || this.config.modelType

    if (this.loadedModels.has(targetModel)) return

    try {
      const MODEL_URL = '/models'

      switch (targetModel) {
        case ModelType.TINY_FACE_DETECTOR: {
          await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
          break
        }
        case ModelType.SSD_MOBILENET_V1: {
          await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
          break
        }
        case ModelType.MTCNN: {
          await faceapi.nets.mtcnn.loadFromUri(MODEL_URL)
          break
        }
      }

      // 加载通用模型（用于特征点检测等）
      if (!this.loadedModels.has(ModelType.TINY_FACE_DETECTOR)) {
        await Promise.all([
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ])
      }

      this.loadedModels.add(targetModel)
      console.info(
        `Face detection model ${MODEL_CONFIGS[targetModel].name} loaded successfully`,
      )
    } catch (error) {
      console.error(
        `Failed to load face detection model ${targetModel}:`,
        error,
      )
      throw new Error(
        `无法加载人脸检测模型: ${MODEL_CONFIGS[targetModel].name}`,
      )
    }
  }

  private createDetectorOptions(modelType: ModelType) {
    switch (modelType) {
      case ModelType.TINY_FACE_DETECTOR: {
        return new faceapi.TinyFaceDetectorOptions({
          inputSize: this.config.inputSize,
          scoreThreshold: this.config.scoreThreshold,
        })
      }
      case ModelType.SSD_MOBILENET_V1: {
        return new faceapi.SsdMobilenetv1Options({
          minConfidence: this.config.scoreThreshold,
          maxResults: this.config.maxResults || 100,
        })
      }
      case ModelType.MTCNN: {
        return new faceapi.MtcnnOptions({
          minFaceSize: 20,
          scaleFactor: 0.709,
          scoreThresholds: [0.6, 0.7, this.config.scoreThreshold],
        })
      }
      default: {
        throw new Error(`Unsupported model type: ${modelType}`)
      }
    }
  }

  async detectFaces(imageElement: HTMLImageElement): Promise<FaceDetection[]> {
    await this.loadModels()

    try {
      const detectorOptions = this.createDetectorOptions(this.config.modelType)

      const detections = await faceapi.detectAllFaces(
        imageElement,
        detectorOptions,
      )

      // 转换为我们的格式
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
      throw new Error(
        `人脸检测失败 (${MODEL_CONFIGS[this.config.modelType].name})`,
      )
    }
  }

  async detectFacesWithLandmarks(imageElement: HTMLImageElement) {
    await this.loadModels()

    try {
      const detectorOptions = this.createDetectorOptions(this.config.modelType)

      const detectionsWithLandmarks = await faceapi
        .detectAllFaces(imageElement, detectorOptions)
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
      throw new Error(
        `人脸特征点检测失败 (${MODEL_CONFIGS[this.config.modelType].name})`,
      )
    }
  }
}

// 创建单例实例
export const faceDetector = new FaceDetector()
