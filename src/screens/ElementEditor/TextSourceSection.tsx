import type React from 'react'
import { useCallback, useState } from 'react'
import { InputDialog } from '@/components/Dialog'
import { Section } from '@/components/List'
import { useLocalization } from '@/localization'
import type { Layout, LayoutField, TextSource } from '@/print'
import { createLayoutField } from '@/print'
import { PickerCell, TextValueCell } from './rows'

type Props = {
  title: string
  layout: Layout
  source: TextSource

  /**
   * 供給元を変える
   *
   * その場で作った入力項目は、要素の変更と一緒に保存するため `field` で渡す。
   */
  onChange: (source: TextSource, field?: LayoutField) => void
}

type SourceKind = TextSource['kind']

/**
 * 文字の供給元（レイアウトに固定するか、印刷データごとに入力するか）を編集する
 */
export const TextSourceSection: React.FC<Props> = ({
  title,
  layout,
  source,
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
          ? { kind: 'static', value: '' }
          : { kind: 'field', fieldId: layout.fields[0]?.id ?? '' },
      )
    },
    [layout.fields, onChange, source.kind],
  )

  return (
    <Section title={title}>
      <PickerCell
        title={t('app_content_source')}
        value={source.kind}
        items={[
          {
            value: 'static' as SourceKind,
            title: t('app_use_fixed_text'),
            description: t('app_use_the_same_text_for_every_print_record'),
          },
          {
            value: 'field' as SourceKind,
            title: t('app_use_an_input_field'),
            description: t('app_enter_different_content_for_each_print_record'),
          },
        ]}
        onChange={onChangeKind}
      />
      {source.kind === 'static' ? (
        <TextValueCell
          title={t('app_content')}
          value={source.value}
          dialogDescription={t('app_use_line_breaks_for_multiline_text')}
          multiline={true}
          onChange={(value) => onChange({ kind: 'static', value })}
        />
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
