# AI 人脸检测集成指南

## 概述

当前应用使用模拟的人脸检测，在生产环境中可以集成以下真实的 AI 服务：

## 推荐的 AI 服务

### 1. OpenAI Vision API
```typescript
async function detectFacesWithOpenAI(imageFile: File): Promise<FaceDetection[]> {
  const base64Image = await fileToBase64(imageFile)
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image and return the coordinates of all human faces as JSON array with x, y, width, height, confidence values (0-1). Return only the JSON array."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    })
  })
  
  const result = await response.json()
  return JSON.parse(result.choices[0].message.content)
}
```

### 2. Google Cloud Vision API
```typescript
async function detectFacesWithGoogle(imageFile: File): Promise<FaceDetection[]> {
  const base64Image = await fileToBase64(imageFile)
  
  const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          image: {
            content: base64Image
          },
          features: [
            {
              type: 'FACE_DETECTION',
              maxResults: 10
            }
          ]
        }
      ]
    })
  })
  
  const result = await response.json()
  const faces = result.responses[0].faceAnnotations || []
  
  return faces.map((face: any) => ({
    x: face.boundingPoly.vertices[0].x,
    y: face.boundingPoly.vertices[0].y,
    width: face.boundingPoly.vertices[2].x - face.boundingPoly.vertices[0].x,
    height: face.boundingPoly.vertices[2].y - face.boundingPoly.vertices[0].y,
    confidence: face.detectionConfidence
  }))
}
```

### 3. AWS Rekognition
```typescript
import { RekognitionClient, DetectFacesCommand } from "@aws-sdk/client-rekognition"

async function detectFacesWithAWS(imageFile: File): Promise<FaceDetection[]> {
  const client = new RekognitionClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
  })
  
  const imageBytes = await imageFile.arrayBuffer()
  
  const command = new DetectFacesCommand({
    Image: {
      Bytes: new Uint8Array(imageBytes)
    },
    Attributes: ['ALL']
  })
  
  const response = await client.send(command)
  const faces = response.FaceDetails || []
  
  return faces.map(face => ({
    x: (face.BoundingBox?.Left || 0) * imageWidth,
    y: (face.BoundingBox?.Top || 0) * imageHeight,
    width: (face.BoundingBox?.Width || 0) * imageWidth,
    height: (face.BoundingBox?.Height || 0) * imageHeight,
    confidence: face.Confidence || 0
  }))
}
```

### 4. 浏览器端 MediaPipe (离线)
```typescript
import { FaceDetection } from '@mediapipe/face_detection'

async function detectFacesWithMediaPipe(imageElement: HTMLImageElement): Promise<FaceDetection[]> {
  const faceDetection = new FaceDetection({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
  })
  
  faceDetection.setOptions({
    model: 'short',
    minDetectionConfidence: 0.5
  })
  
  return new Promise((resolve) => {
    faceDetection.onResults((results) => {
      const faces = results.detections.map(detection => ({
        x: detection.boundingBox.xCenter * imageElement.width - (detection.boundingBox.width * imageElement.width) / 2,
        y: detection.boundingBox.yCenter * imageElement.height - (detection.boundingBox.height * imageElement.height) / 2,
        width: detection.boundingBox.width * imageElement.width,
        height: detection.boundingBox.height * imageElement.height,
        confidence: detection.score[0]
      }))
      resolve(faces)
    })
    
    faceDetection.send({ image: imageElement })
  })
}
```

## 环境变量配置

在 `.env.local` 文件中添加相应的 API 密钥：

```env
# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Google Cloud Vision
GOOGLE_VISION_API_KEY=your_google_vision_api_key

# AWS Rekognition
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

## 集成到现有代码

替换 `detectFaces` 函数中的模拟代码：

```typescript
const detectFaces = useCallback(async () => {
  if (!processedImage) return
  
  setIsDetecting(true)
  
  try {
    // 选择你想使用的 AI 服务
    const faces = await detectFacesWithOpenAI(uploadedFile!)
    // 或者: const faces = await detectFacesWithGoogle(uploadedFile!)
    // 或者: const faces = await detectFacesWithAWS(uploadedFile!)
    
    setProcessedImage(prev => prev ? { ...prev, faces } : null)
    
    if (showFaceBoxes) {
      drawFaceBoxes(faces)
    }
  } catch (error) {
    console.error('人脸检测失败:', error)
    alert('人脸检测失败，请重试')
  } finally {
    setIsDetecting(false)
  }
}, [processedImage, uploadedFile, showFaceBoxes])
```

## 性能优化建议

1. **图片压缩**: 在发送到 AI API 之前压缩图片
2. **缓存结果**: 避免重复检测同一张图片
3. **错误处理**: 提供友好的错误提示
4. **加载状态**: 显示详细的处理进度

## 成本考虑

- **OpenAI Vision**: 按请求计费，约 $0.01-0.02/图片
- **Google Cloud Vision**: 前 1000 次免费，之后 $1.50/1000 次
- **AWS Rekognition**: 前 5000 次免费，之后 $0.001/图片
- **MediaPipe**: 完全免费，在浏览器端运行 