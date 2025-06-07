import { Button } from '~/components/ui/button'

export const Footer = () => {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center space-y-4">
          {/* 主要内容 */}
          <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
            <span>Made with ❤️ by</span>
            <a
              href="https://github.com/innei"
              target="_blank"
              rel="noopener noreferrer"
              className="h-auto p-0 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium flex items-center space-x-1"
            >
              <i className="i-mingcute-github-line text-base" />
              <span>@Innei</span>
            </a>
          </div>

          {/* 项目链接 */}
          <div className="flex items-center space-x-4">
            <Button
              asChild
              variant="ghost"
              className="h-auto px-3 py-1.5 text-xs text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <a
                href="https://github.com/innei/face-mask-web"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5"
              >
                <i className="i-mingcute-code-line text-sm" />
                <span>View Source</span>
              </a>
            </Button>

            <div className="w-px h-4 bg-gray-300 dark:bg-gray-700" />

            <span className="text-xs text-gray-400 dark:text-gray-600">
              Face Mask Web
            </span>
          </div>

          {/* 版权信息 */}
          <div className="text-xs text-gray-400 dark:text-gray-600 text-center">
            © {new Date().getFullYear()} All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
