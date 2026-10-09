import type React from 'react'
import { useCallback, useState } from 'react'
import { StyleSheet, View, type ViewStyle } from 'react-native'
import { BASE64 } from '@/CONSTANTS'
import { InputDialog } from '@/components/Dialog'
import { ImageFileView } from '@/components/ImageFileView'
import { Section } from '@/components/List'
import { useLocalization } from '@/localization'
import type { ImageSource, Layout, LayoutField } from '@/print'
import { createLayoutField } from '@/print'
import { copyImageFile } from '@/utils/imageStore'
import { styleType } from '@/utils/styles'
import { createUUID } from '@/utils/uuid'
import { PickerCell } from './rows'

type Props = {
  layout: Layout
  source: ImageSource
  width: number
  /**
   * 供給元を変える
   *
   * その場で作った入力項目は、要素の変更と一緒に保存するため `field` で渡す。
   */
  onChange: (source: ImageSource, field?: LayoutField) => void
}

type SourceKind = ImageSource['kind']

/**
 * 画像の供給元を編集する
 */
export const ImageSourceSection: React.FC<Props> = ({
  layout,
  source,
  width,
  onChange,
}) => {
  const t = useLocalization()

  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false)

  const onSubmitNewField = useCallback(
    (label: string) => {
      setIsDialogVisible(false)
      const trimmed = label.trim()
      const field = createLayoutField({
        label: trimmed || t('app_input_fields'),
        key: trimmed || `field${layout.fields.length + 1}`,
        valueType: 'image',
      })
      onChange({ kind: 'field', fieldId: field.id }, field)
    },
    [t, layout.fields.length, onChange],
  )

  const onChangeKind = useCallback(
    (kind: SourceKind) => {
      if (kind === source.kind) {
        return
      }
      // 入力項目が1つも無いまま選ぶと、どこも指す先のない参照ができてしまう。
      // 先に入力項目を作らせてから結びつける。
      if (kind === 'field' && layout.fields.length === 0) {
        setIsDialogVisible(true)
        return
      }
      onChange(
        kind === 'static'
          ? { kind: 'static' }
          : { kind: 'field', fieldId: layout.fields[0]?.id ?? '' },
      )
    },
    [layout.fields, onChange, source.kind],
  )

  const onChangeImage = useCallback(
    async (pickedPath: string) => {
      try {
        // 画像を選び直したら別のアセットとして保存する
        const id = createUUID()
        const path = await copyImageFile(id, pickedPath)
        onChange({
          kind: 'static',
          asset: { id, path, width, imageType: 'binary' },
        })
      } catch (e: any) {
        console.warn('onChangeImage', e)
      }
    },
    [onChange, width],
  )

  return (
    <Section title={t('app_content')}>
      <PickerCell
        title={t('app_content_source')}
        value={source.kind}
        items={[
          {
            value: 'static' as SourceKind,
            title: t('app_use_a_fixed_image'),
            description: t('app_use_the_same_image_for_every_print_record'),
          },
          {
            value: 'field' as SourceKind,
            title: t('app_use_an_input_field'),
            description: t(
              'app_choose_a_different_image_for_each_print_record',
            ),
          },
        ]}
        onChange={onChangeKind}
      />
      {source.kind === 'static' ? (
        <View style={styles.imageView}>
          <ImageFileView path={source.asset?.path} onChange={onChangeImage} />
        </View>
      ) : (
        <PickerCell
          title={t('app_input_fields')}
          description={t(
            'app_fields_whose_content_can_vary_between_print_records',
          )}
          value={source.fieldId}
          items={layout.fields.map((field) => ({
            value: field.id,
            title: field.label || field.key,
            description: field.key,
          }))}
          action={{
            title: t('app_add_an_input_field'),
            description: t('app_create_a_new_input_field_in_this_layout'),
            onPress: () => setIsDialogVisible(true),
          }}
          onChange={(fieldId) => onChange({ kind: 'field', fieldId })}
        />
      )}
      <InputDialog
        isVisible={isDialogVisible}
        title={t('app_add_input_field')}
        description={t('app_enter_a_display_name')}
        onPress={onSubmitNewField}
        onCancel={() => setIsDialogVisible(false)}
      />
    </Section>
  )
}

const styles = StyleSheet.create({
  imageView: styleType<ViewStyle>({
    alignItems: 'center',
    paddingVertical: 16,
    width: '100%',
    minHeight: BASE64.PROFILE_ICON_SIZE,
  }),
})
