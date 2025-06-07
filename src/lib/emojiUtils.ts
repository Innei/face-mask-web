// 预定义的Emoji表情
export const DEFAULT_EMOJI_OPTIONS = [
  '😀',
  '😃',
  '😄',
  '😁',
  '😆',
  '😅',
  '😂',
  '🤣',
  '😊',
  '😇',
  '🙂',
  '🙃',
  '😉',
  '😌',
  '😍',
  '🥰',
  '😘',
  '😗',
  '😙',
  '😚',
  '😋',
  '😛',
  '😝',
  '😜',
  '🤪',
  '🤨',
  '🧐',
  '🤓',
  '😎',
  '🤩',
  '🥳',
  '😏',
  '😒',
  '😞',
  '😔',
  '😟',
  '😕',
  '🙁',
  '☹️',
  '😣',
  '😖',
  '😫',
  '😩',
  '🥺',
  '😢',
  '😭',
  '😤',
  '😠',
  '😡',
  '🤬',
  '🤯',
  '😳',
  '🥵',
  '🥶',
  '😱',
  '😨',
  '😰',
  '😥',
  '😓',
  '🤗',
  '🤔',
  '🤭',
  '🤫',
  '🤥',
  '😶',
  '😐',
  '😑',
  '😬',
  '🙄',
  '😯',
  '😦',
  '😧',
  '😮',
  '😲',
  '🥱',
  '😴',
  '🤤',
  '😪',
  '😵',
  '🤐',
]

/**
 * 从给定的 emoji 列表中随机选择指定数量的 emoji
 * @param emojiList 可选择的 emoji 列表
 * @param count 需要选择的数量
 * @returns 随机选择的 emoji 数组
 */
export function getRandomEmojis(emojiList: string[], count: number): string[] {
  if (count <= 0) return []
  if (emojiList.length === 0) return []

  const result: string[] = []
  const availableEmojis = [...emojiList] // 创建副本避免修改原数组

  for (let i = 0; i < count; i++) {
    if (availableEmojis.length === 0) {
      // 如果没有更多可用的 emoji，重新填充列表
      availableEmojis.push(...emojiList)
    }

    const randomIndex = Math.floor(Math.random() * availableEmojis.length)
    const selectedEmoji = availableEmojis.splice(randomIndex, 1)[0]
    result.push(selectedEmoji)
  }

  return result
}

/**
 * 验证 emoji 字符串是否有效
 * @param emoji emoji 字符串
 * @returns 是否为有效的 emoji
 */
export function isValidEmoji(emoji: string): boolean {
  // 简单的 emoji 验证，检查是否包含 emoji 字符
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u
  return emojiRegex.test(emoji) && emoji.length <= 4
}

/**
 * 清理和验证自定义 emoji 列表
 * @param customEmojis 自定义 emoji 字符串，用逗号或空格分隔
 * @returns 清理后的有效 emoji 数组
 */
export function parseCustomEmojis(customEmojis: string): string[] {
  if (!customEmojis.trim()) return []

  // 分割字符串，支持逗号、空格、换行符分隔
  const emojis = customEmojis
    .split(/[,\s]+/)
    .map((emoji) => emoji.trim())
    .filter((emoji) => emoji.length > 0 && isValidEmoji(emoji))

  // 去重
  return [...new Set(emojis)]
}
