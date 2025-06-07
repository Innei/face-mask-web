import twemoji from 'twemoji'

export interface FaceDetection {
  x: number
  y: number
  width: number
  height: number
  confidence: number
}

export class ImageProcessor {
  // 将 emoji 转换为图片
  private async emojiToImage(
    emoji: string,
    _size: number,
  ): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      // 使用 twemoji 将 emoji 转换为 SVG
      const svg = twemoji.parse(emoji, {
        folder: 'svg',
        ext: '.svg',
        base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/',
      })

      // 创建一个临时 div 来解析 SVG
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = svg
      const imgElement = tempDiv.querySelector('img') as HTMLImageElement

      if (!imgElement) {
        reject(new Error('无法解析 emoji'))
        return
      }

      // 创建新的图片元素
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('emoji 图片加载失败'))
      img.src = imgElement.src
    })
  }

  // 处理图片并替换人脸为Emoji
  async processImageWithEmojis(
    imageElement: HTMLImageElement,
    faces: FaceDetection[],
    emojis: string[],
  ): Promise<string> {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('无法创建canvas上下文')
    }

    // 设置canvas尺寸
    canvas.width = imageElement.naturalWidth
    canvas.height = imageElement.naturalHeight

    // 绘制原图
    ctx.drawImage(imageElement, 0, 0)

    // 为每个检测到的人脸绘制Emoji
    for (const [i, face] of faces.entries()) {
      const emoji = emojis[i % emojis.length]

      try {
        // 计算 emoji 大小，确保完全覆盖人脸
        const emojiSize = Math.max(face.width, face.height) * 1.2 // 增加20%确保完全覆盖

        // 获取 emoji 图片
        const emojiImg = await this.emojiToImage(emoji, emojiSize)

        // 计算绘制位置，确保居中
        const drawX = face.x + face.width / 2 - emojiSize / 2
        const drawY = face.y + face.height / 2 - emojiSize / 2

        // 绘制 emoji 图片
        ctx.drawImage(emojiImg, drawX, drawY, emojiSize, emojiSize)
      } catch (error) {
        console.warn(`Failed to render emoji ${emoji}:`, error)
        // 如果 twemoji 失败，回退到文本渲染
        const fontSize = Math.max(face.width, face.height) * 1.2
        ctx.font = `${fontSize}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        const centerX = face.x + face.width / 2
        const centerY = face.y + face.height / 2

        ctx.fillText(emoji, centerX, centerY)
      }
    }

    // 获取处理后的图片
    return canvas.toDataURL('image/jpeg', 1)
  }

  // 调整图片大小以优化性能
  resizeImage(
    imageElement: HTMLImageElement,
    maxWidth = 1200,
    maxHeight = 800,
  ): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const { naturalWidth, naturalHeight } = imageElement

      // 如果图片已经足够小，直接返回
      if (naturalWidth <= maxWidth && naturalHeight <= maxHeight) {
        resolve(imageElement)
        return
      }

      // 计算缩放比例
      const scaleX = maxWidth / naturalWidth
      const scaleY = maxHeight / naturalHeight
      const scale = Math.min(scaleX, scaleY)

      const newWidth = naturalWidth * scale
      const newHeight = naturalHeight * scale

      // 创建canvas进行缩放
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!

      canvas.width = newWidth
      canvas.height = newHeight

      // 绘制缩放后的图片
      ctx.drawImage(imageElement, 0, 0, newWidth, newHeight)

      // 创建新的图片元素
      const resizedImage = new Image()
      resizedImage.onload = () => resolve(resizedImage)
      resizedImage.src = canvas.toDataURL('image/jpeg', 0.8)
    })
  }

  // 从文件创建图片元素
  createImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('请选择图片文件'))
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error('图片加载失败'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsDataURL(file)
    })
  }
}

// 创建单例实例
export const imageProcessor = new ImageProcessor()
