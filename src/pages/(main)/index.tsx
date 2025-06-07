import { ConfigForm } from '~/components/ConfigForm'
import { EmojiSection } from '~/components/EmojiSection'
import { ImagePreview } from '~/components/ImagePreview'
import { ImageUpload } from '~/components/ImageUpload'

export const Component = () => {
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 标题 */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            AI 人脸 Emoji 替换器
          </h1>
          <p className="text-lg text-muted-foreground">
            上传图片，AI 自动检测人脸并替换为有趣的 Emoji 表情
          </p>
        </div>

        {/* 配置面板 */}
        <ConfigForm />

        {/* 文件上传区域 */}
        <ImageUpload />

        {/* 图片预览和处理区域 */}
        <ImagePreview />

        {/* Emoji选择区域 */}
        <EmojiSection />
      </div>
    </div>
  )
}
