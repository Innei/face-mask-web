import { useAtom } from 'jotai'
import { isValidElement } from 'react'

import { faceDetectionConfigAtom, useRandomSelectionAtom } from '~/atoms/app'
import { clsxm } from '~/lib/cn'

import { Checkbox } from './ui/checkbox'
import { ResponsiveSelect } from './ui/select/ResponsiveSelect'
import { Slider } from './ui/slider'

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
        <FormItem label="输入尺寸 (Input Size)">
          <ResponsiveSelect
            value={faceDetectionConfig.inputSize.toString()}
            onValueChange={(value) =>
              setFaceDetectionConfig((prev) => ({
                ...prev,
                inputSize: Number(value),
              }))
            }
            items={[
              { label: '320 (快速)', value: '320' },
              { label: '416 (平衡)', value: '416' },
              { label: '512 (精确)', value: '512' },
              { label: '608 (最精确)', value: '608' },
            ]}
          />
        </FormItem>

        <FormItem label="置信度阈值 (Score Threshold)">
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
          <div className="text-sm text-muted-foreground text-center">
            {faceDetectionConfig.scoreThreshold}
          </div>
        </FormItem>

        <FormItem label="最大检测数量">
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
}: {
  children: React.ReactNode
  label: string
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
    <div className="flex flex-col gap-2">
      <label
        className={clsxm(
          'text-sm font-medium text-foreground',
          labelShouldMarginLeft && 'pl-3',
        )}
      >
        {label}
      </label>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}
