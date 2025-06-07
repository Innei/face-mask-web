import { useAtom, useAtomValue } from 'jotai'
import { useCallback } from 'react'
import { toast } from 'sonner'
import twemoji from 'twemoji'

import {
  customEmojiInputAtom,
  customEmojisAtom,
  faceDetectionsAtom,
  selectedEmojisAtom,
  useRandomSelectionAtom,
} from '~/atoms/app'
import { Button } from '~/components/ui/button'
import {
  DEFAULT_EMOJI_OPTIONS,
  getRandomEmojis,
  parseCustomEmojis,
} from '~/lib/emojiUtils'

export const EmojiSection = () => {
  const [selectedEmojis, setSelectedEmojis] = useAtom(selectedEmojisAtom)
  const [customEmojiInput, setCustomEmojiInput] = useAtom(customEmojiInputAtom)
  const [customEmojis, setCustomEmojis] = useAtom(customEmojisAtom)
  const useRandomSelection = useAtomValue(useRandomSelectionAtom)
  const faceDetections = useAtomValue(faceDetectionsAtom)

  // 获取当前可用的 emoji 列表
  const getAvailableEmojis = useCallback(() => {
    return customEmojis.length > 0 ? customEmojis : DEFAULT_EMOJI_OPTIONS
  }, [customEmojis])

  // Emoji选择处理
  const toggleEmoji = useCallback(
    (emoji: string) => {
      setSelectedEmojis((prev) => {
        if (prev.includes(emoji)) {
          return prev.filter((e) => e !== emoji)
        } else {
          return [...prev, emoji]
        }
      })
    },
    [setSelectedEmojis],
  )

  // 处理自定义 emoji 输入
  const handleCustomEmojiSubmit = useCallback(() => {
    const parsed = parseCustomEmojis(customEmojiInput)
    if (parsed.length > 0) {
      setCustomEmojis(parsed)
      toast.success(`添加了 ${parsed.length} 个自定义 emoji`)
    } else {
      toast.error('请输入有效的 emoji 表情')
    }
  }, [customEmojiInput, setCustomEmojis])

  // 清除自定义 emoji
  const clearCustomEmojis = useCallback(() => {
    setCustomEmojis([])
    setCustomEmojiInput('')
    toast.success('已清除自定义 emoji')
  }, [setCustomEmojis, setCustomEmojiInput])

  // 重新随机选择 emoji
  const reRandomizeEmojis = useCallback(() => {
    if (faceDetections.length > 0) {
      const availableEmojis = getAvailableEmojis()
      const randomEmojis = getRandomEmojis(
        availableEmojis,
        faceDetections.length,
      )
      setSelectedEmojis(randomEmojis)
      toast.success('已重新随机选择 emoji')
    }
  }, [faceDetections.length, getAvailableEmojis, setSelectedEmojis])

  // 渲染 emoji 使用 twemoji
  const renderEmoji = useCallback((emoji: string) => {
    const parsed = twemoji.parse(emoji, {
      folder: 'svg',
      ext: '.svg',
      base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/',
    })
    return <span dangerouslySetInnerHTML={{ __html: parsed }} />
  }, [])

  if (faceDetections.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* 自定义 Emoji 面板 */}
      <div className="p-6 border border-border rounded-lg bg-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          自定义 Emoji
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              输入自定义 emoji（用空格或逗号分隔）
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customEmojiInput}
                onChange={(e) => setCustomEmojiInput(e.target.value)}
                placeholder="例如: 🎭 🎪 🎨 🎯"
                className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button
                onClick={handleCustomEmojiSubmit}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                添加
              </Button>
              {customEmojis.length > 0 && (
                <Button onClick={clearCustomEmojis} variant="secondary">
                  清除
                </Button>
              )}
            </div>
          </div>

          {customEmojis.length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">
                当前自定义 emoji ({customEmojis.length} 个):
              </p>
              <div className="flex flex-wrap gap-2">
                {customEmojis.map((emoji, index) => (
                  <span key={index} className="text-2xl">
                    {renderEmoji(emoji)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Emoji选择区域 */}
      <div className="p-6 border border-border rounded-lg bg-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            选择 Emoji 表情 (已选择 {selectedEmojis.length} 个)
          </h3>
          <div className="flex gap-2">
            {useRandomSelection && (
              <Button onClick={reRandomizeEmojis} variant="secondary">
                重新随机选择
              </Button>
            )}
          </div>
        </div>

        {selectedEmojis.length > 0 && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium text-foreground mb-2">
              当前选中的 emoji:
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedEmojis.map((emoji, index) => (
                <span key={index} className="text-2xl">
                  {renderEmoji(emoji)}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 gap-2 mb-4">
          {getAvailableEmojis().map((emoji) => (
            <button
              type="button"
              key={emoji}
              onClick={() => toggleEmoji(emoji)}
              className={`text-2xl p-2 rounded-lg border-2 transition-colors ${
                selectedEmojis.includes(emoji)
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              {renderEmoji(emoji)}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          {useRandomSelection
            ? '已启用自动随机选择，检测到人脸后会自动选择对应数量的 emoji'
            : '点击选择多个 Emoji，将按顺序应用到检测到的人脸上'}
        </p>
      </div>
    </div>
  )
}
