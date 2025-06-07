import { useAtom } from 'jotai'

import { faceDetectionConfigAtom, useRandomSelectionAtom } from '~/atoms/app'

export const ConfigForm = () => {
  const [faceDetectionConfig, setFaceDetectionConfig] = useAtom(
    faceDetectionConfigAtom,
  )
  const [useRandomSelection, setUseRandomSelection] = useAtom(
    useRandomSelectionAtom,
  )

  return (
    <div className="space-y-6 p-6 border border-border rounded-lg bg-card">
      <h3 className="text-lg font-semibold text-foreground">检测配置</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            输入尺寸 (Input Size)
          </label>
          <select
            value={faceDetectionConfig.inputSize}
            onChange={(e) =>
              setFaceDetectionConfig((prev) => ({
                ...prev,
                inputSize: Number(e.target.value),
              }))
            }
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value={320}>320 (快速)</option>
            <option value={416}>416 (平衡)</option>
            <option value={512}>512 (精确)</option>
            <option value={608}>608 (最精确)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            置信度阈值 (Score Threshold)
          </label>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.1"
            value={faceDetectionConfig.scoreThreshold}
            onChange={(e) =>
              setFaceDetectionConfig((prev) => ({
                ...prev,
                scoreThreshold: Number(e.target.value),
              }))
            }
            className="w-full accent-primary"
          />
          <div className="text-sm text-muted-foreground text-center">
            {faceDetectionConfig.scoreThreshold}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            最大检测数量
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={faceDetectionConfig.maxResults || 10}
            onChange={(e) =>
              setFaceDetectionConfig((prev) => ({
                ...prev,
                maxResults: Number(e.target.value),
              }))
            }
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="random-selection"
          checked={useRandomSelection}
          onChange={(e) => setUseRandomSelection(e.target.checked)}
          className="rounded border-input"
        />
        <label
          htmlFor="random-selection"
          className="text-sm font-medium text-foreground"
        >
          自动随机选择 emoji（检测到人脸后自动选择对应数量的 emoji）
        </label>
      </div>
    </div>
  )
}
