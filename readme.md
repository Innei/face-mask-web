# AI 人脸 Emoji 替换器

一个基于 AI 的人脸检测和 Emoji 替换应用，使用 face-api.js 进行实时人脸检测，并用有趣的 Emoji 表情替换检测到的人脸。

## ✨ 主要功能

### 🤖 AI 人脸检测

- **face-api.js 集成** - 使用先进的 AI 模型进行人脸检测
- **可配置参数** - 支持调整检测精度、置信度阈值等参数
- **实时检测** - 图片上传后自动进行人脸检测
- **多人脸支持** - 可同时检测多个人脸

### 🎭 Emoji 替换功能

- **Twemoji 渲染** - 使用 Twitter 的 Twemoji 库渲染高质量 Emoji
- **完全遮挡** - Emoji 完全覆盖人脸，确保隐私保护
- **随机选择** - 根据检测到的人脸数量自动随机选择 Emoji
- **自定义 Emoji** - 支持添加自定义 Emoji 表情

### ⚙️ 高级配置

- **检测参数调整** - 可调整输入尺寸、置信度阈值、最大检测数量
- **智能选择模式** - 自动为每个检测到的人脸选择不同的 Emoji
- **手动选择模式** - 支持手动选择特定的 Emoji 表情
- **批量处理** - 一次性处理多个人脸

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm


### 模型文件

确保在 `public/models/` 目录下有以下 face-api.js 模型文件：

- `tiny_face_detector_model-weights_manifest.json`
- `tiny_face_detector_model-shard1`
- `face_landmark_68_model-weights_manifest.json`
- `face_landmark_68_model-shard1`
- `face_recognition_model-weights_manifest.json`
- `face_recognition_model-shard1`

## 📖 使用指南

### 1. 配置检测参数

在配置面板中调整以下参数：

- **输入尺寸**: 320 (快速) - 608 (最精确)
- **置信度阈值**: 0.1 - 0.9，数值越高检测越严格
- **最大检测数量**: 限制检测的人脸数量
- **自动随机选择**: 开启后会自动为检测到的人脸选择 Emoji

### 2. 自定义 Emoji

- 在自定义 Emoji 面板中输入想要的表情
- 支持用空格或逗号分隔多个 Emoji
- 添加后会替换默认的 Emoji 选项

### 3. 处理图片

1. 拖拽或点击上传图片
2. 系统自动检测人脸并显示检测框
3. 选择或自动分配 Emoji 表情
4. 点击"生成 Emoji 头像"处理图片
5. 下载处理后的图片

## 🛠️ 技术栈

### 前端框架

- **React 19** - 最新的 React 版本
- **TypeScript** - 类型安全的开发体验
- **Vite** - 快速的构建工具
- **TailwindCSS** - 实用优先的 CSS 框架

### AI 和图像处理

- **face-api.js** - 浏览器端人脸检测库
- **Canvas API** - 图像处理和渲染
- **Twemoji** - Twitter Emoji 渲染库

### UI 组件

- **Radix UI** - 无障碍的 UI 组件
- **Lucide React** - 现代图标库
- **Sonner** - 优雅的通知组件

## 📁 项目结构

```
src/
├── components/          # UI 组件
│   ├── ui/             # 基础 UI 组件
│   └── common/         # 通用组件
├── pages/              # 页面组件
├── lib/                # 工具库
│   ├── faceDetection.ts    # 人脸检测逻辑
│   ├── imageProcessor.ts   # 图像处理逻辑
│   └── emojiUtils.ts       # Emoji 工具函数
├── hooks/              # 自定义 Hooks
└── styles/             # 样式文件
```

## 🎯 核心功能实现

### 人脸检测配置

```typescript
interface FaceDetectionConfig {
  inputSize: number        // 输入尺寸 (320-608)
  scoreThreshold: number   // 置信度阈值 (0.1-0.9)
  maxResults?: number      // 最大检测数量
}
```

### 随机 Emoji 选择

```typescript
// 根据人脸数量随机选择 Emoji
const randomEmojis = getRandomEmojis(availableEmojis, faceCount)
```

### 自定义 Emoji 解析

```typescript
// 解析用户输入的自定义 Emoji
const customEmojis = parseCustomEmojis("🎭 🎪 🎨 🎯")
```

## 🔧 配置选项

### 检测精度调整

- **快速模式** (320): 适合实时预览
- **平衡模式** (416): 推荐的默认设置
- **精确模式** (512): 更高的检测精度
- **最精确模式** (608): 最高精度，处理较慢

### Emoji 选择策略

- **自动随机**: 系统自动为每个人脸选择不同的 Emoji
- **手动选择**: 用户手动选择要使用的 Emoji
- **自定义表情**: 使用用户自定义的 Emoji 集合

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源。

## 🙏 致谢

- [face-api.js](https://github.com/justadudewhohacks/face-api.js) - 人脸检测库
- [Twemoji](https://twemoji.twitter.com/) - Twitter Emoji 图标
- [React](https://react.dev) - 前端框架
- [TailwindCSS](https://tailwindcss.com) - CSS 框架

---

**开始创建有趣的 Emoji 头像吧！** 🎭✨
