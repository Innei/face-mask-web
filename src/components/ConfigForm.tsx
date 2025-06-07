import { useAtom } from 'jotai'
import { isValidElement, useMemo, useState } from 'react'

import { faceDetectionConfigAtom, useRandomSelectionAtom } from '~/atoms/app'
import { clsxm } from '~/lib/cn'
import { faceDetector, MODEL_CONFIGS, ModelType } from '~/lib/faceDetection'

import { Checkbox } from './ui/checkbox'
import { ResponsiveSelect } from './ui/select/ResponsiveSelect'
import { Slider } from './ui/slider'

// 模型类型选项
const modelTypeOptions = [
  {
    label: `${MODEL_CONFIGS[ModelType.TINY_FACE_DETECTOR].name} - ${MODEL_CONFIGS[ModelType.TINY_FACE_DETECTOR].description}`,
    value: ModelType.TINY_FACE_DETECTOR,
  },
  {
    label: `${MODEL_CONFIGS[ModelType.SSD_MOBILENET_V1].name} - ${MODEL_CONFIGS[ModelType.SSD_MOBILENET_V1].description}`,
    value: ModelType.SSD_MOBILENET_V1,
  },
  {
    label: `${MODEL_CONFIGS[ModelType.MTCNN].name} - ${MODEL_CONFIGS[ModelType.MTCNN].description}`,
    value: ModelType.MTCNN,
  },
]

export const ConfigForm = () => {
  const [faceDetectionConfig, setFaceDetectionConfig] = useAtom(
    faceDetectionConfigAtom,
  )
  const [useRandomSelection, setUseRandomSelection] = useAtom(
    useRandomSelectionAtom,
  )
  const [isLoadingModel, setIsLoadingModel] = useState(false)

  // 根据选择的模型类型获取可用的输入尺寸选项
  const inputSizeOptions = useMemo(() => {
    const modelConfig = MODEL_CONFIGS[faceDetectionConfig.modelType]
    return modelConfig.inputSizeOptions.map((size) => ({
      label: `${size} ${size <= 320 ? '(快速)' : size <= 416 ? '(平衡)' : size <= 512 ? '(精确)' : '(最精确)'}`,
      value: size.toString(),
    }))
  }, [faceDetectionConfig.modelType])

  const handleModelTypeChange = async (value: string) => {
    const newModelType = value as ModelType
    const modelConfig = MODEL_CONFIGS[newModelType]

    setFaceDetectionConfig((prev) => ({
      ...prev,
      modelType: newModelType,
      // 自动设置该模型的默认输入尺寸
      inputSize:
        modelConfig.defaultInputSize > 0
          ? modelConfig.defaultInputSize
          : prev.inputSize,
    }))

    // 预加载新模型
    setIsLoadingModel(true)
    try {
      await faceDetector.loadModels(newModelType)
    } catch (error) {
      console.error('Failed to preload model:', error)
    } finally {
      setIsLoadingModel(false)
    }
  }

  const currentModelConfig = MODEL_CONFIGS[faceDetectionConfig.modelType]
  const showInputSize = currentModelConfig.inputSizeOptions.length > 0

  return (
    <div className="space-y-6 p-6 border border-border rounded-lg bg-card">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">检测配置</h3>
        <p className="text-sm text-muted-foreground">
          选择不同的模型以平衡检测速度和精度。默认推荐使用高精度模型。
        </p>
      </div>

      <div className="space-y-4">
        {/* 模型类型选择 */}
        <FormItem label="检测模型">
          <ResponsiveSelect
            value={faceDetectionConfig.modelType}
            onValueChange={handleModelTypeChange}
            items={modelTypeOptions}
            disabled={isLoadingModel}
          />
        </FormItem>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 输入尺寸选择 - 仅在支持的模型中显示 */}
          {showInputSize && (
            <FormItem
              label="输入尺寸 (Input Size)"
              description="更大的输入尺寸提供更高精度，但处理速度更慢"
            >
              <ResponsiveSelect
                value={faceDetectionConfig.inputSize.toString()}
                onValueChange={(value) =>
                  setFaceDetectionConfig((prev) => ({
                    ...prev,
                    inputSize: Number(value),
                  }))
                }
                items={inputSizeOptions}
              />
            </FormItem>
          )}

          <FormItem
            label={`置信度阈值 (${faceDetectionConfig.scoreThreshold})`}
            description="较高的阈值减少误检，但可能遗漏一些人脸"
          >
            <Slider
              min={0.1}
              max={0.9}
              step={0.1}
              value={[faceDetectionConfig.scoreThreshold]}
              onValueChange={(value) =>
                setFaceDetectionConfig((prev) => ({
                  ...prev,
                  scoreThreshold: value[0],
                }))
              }
              className="w-full h-8"
            />
          </FormItem>

          <FormItem
            label={`最大检测数量 (${faceDetectionConfig.maxResults})`}
            description="限制检测的人脸数量，避免处理过多人脸影响性能"
          >
            <Slider
              min={1}
              max={20}
              value={[faceDetectionConfig.maxResults || 10]}
              onValueChange={(value) =>
                setFaceDetectionConfig((prev) => ({
                  ...prev,
                  maxResults: value[0],
                }))
              }
              className="w-full h-8"
            />
          </FormItem>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="random-selection"
          checked={useRandomSelection}
          onCheckedChange={(checked) =>
            setUseRandomSelection(checked === 'indeterminate' ? false : checked)
          }
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

const FormItem = ({
  children,
  label,
  description,
}: {
  children: React.ReactNode
  label: string
  description?: string
}) => {
  let labelShouldMarginLeft = false

  if (
    typeof children === 'object' &&
    children &&
    isValidElement(children) &&
    'props' in children
  ) {
    switch (children.type) {
      case ResponsiveSelect: {
        labelShouldMarginLeft = true
        break
      }
    }
  }
  return (
    <div className="flex flex-col gap-2 mt-2">
      <label
        className={clsxm(
          'text-sm font-medium text-foreground',
          labelShouldMarginLeft && 'pl-3',
        )}
      >
        {label}
      </label>
      {description && (
        <p
          className={clsxm(
            'text-xs text-muted-foreground my-1',
            labelShouldMarginLeft && 'pl-3',
          )}
        >
          {description}
        </p>
      )}
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}
