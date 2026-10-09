import {
  type RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native'
import type React from 'react'
import { useCallback, useLayoutEffect, useMemo } from 'react'
import {
  StyleSheet,
  Text,
  type TextStyle,
  useColorScheme,
  View,
  type ViewStyle,
} from 'react-native'
import AlertAsync from 'react-native-alert-async'
import { makeStyles } from 'react-native-swag-styles'
import { useDispatch, useSelector } from 'react-redux'
import { BASE64, COLOR, MESSAGE } from '@/CONSTANTS'
import { Cell, Section } from '@/components/List'
import { SafeScrollView } from '@/components/SafeScrollView'
import { t, useLocalization } from '@/localization'
import type { Layout, LayoutElement, LayoutField } from '@/print'
import { removeElement, replaceElement, upsertField } from '@/print'
import { selectLayoutById } from '@/redux/modules/layout/selectors'
import { saveLayout } from '@/redux/modules/layout/slice'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import type { MainParams } from '@/routes/main.params'
import { styleType } from '@/utils/styles'
import { describeElementType } from '../LayoutEditor/describeElement'
import { ImageSourceSection } from './ImageSourceSection'
import {
  alignmentItems,
  barTypeItems,
  errorLevelItems,
  fontSizeItems,
  imageTypeItems,
  timestampFormatItems,
} from './options'
import { NumberValueCell, PickerCell, TextValueCell } from './rows'
import { TextSourceSection } from './TextSourceSection'

type ParamsProps = RouteProp<MainParams, 'ElementEditor'>

type Props = {}
type ComponentProps = Props & {
  layout: Layout | undefined
  element: LayoutElement | undefined
  /**
   * 要素を差し替える
   *
   * 供給元の編集でその場で作った入力項目は `field` で受け取り、
   * 要素の変更と同じ保存へまとめる。別々に保存すると片方が失われる。
   */
  onChange: (element: LayoutElement, field?: LayoutField) => void
  onDelete: () => void
}

const hideWhenEmptyCell = (
  element: Extract<LayoutElement, { hideWhenEmpty: boolean }>,
  onChange: (element: LayoutElement) => void,
) => (
  <Cell
    title={t('app_skip_this_element_when_empty')}
    accessory="switch"
    switchValue={element.hideWhenEmpty}
    onSwitchValueChange={(hideWhenEmpty) =>
      onChange({ ...element, hideWhenEmpty })
    }
  />
)

const Component: React.FC<ComponentProps> = ({
  layout,
  element,
  onChange,
  onDelete,
}) => {
  const t = useLocalization()

  const styles = useStyles()

  if (!layout || !element) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{t('app_element_not_found')}</Text>
      </View>
    )
  }

  return (
    <SafeScrollView style={styles.scrollView}>
      {element.type === 'text' && (
        <>
          <TextSourceSection
            title={t('app_content')}
            layout={layout}
            source={element.source}
            onChange={(source, field) =>
              onChange({ ...element, source }, field)
            }
          />
          <Section title={t('app_appearance')}>
            <PickerCell
              title={t('app_font_size')}
              value={element.fontSize}
              items={fontSizeItems}
              onChange={(fontSize) => onChange({ ...element, fontSize })}
            />
            <PickerCell
              title={t('app_alignment')}
              value={element.alignment}
              items={alignmentItems}
              onChange={(alignment) => onChange({ ...element, alignment })}
            />
            <Cell
              title={t('app_bold')}
              accessory="switch"
              switchValue={element.bold}
              onSwitchValueChange={(bold) => onChange({ ...element, bold })}
            />
            <Cell
              title={t('app_underline')}
              accessory="switch"
              switchValue={element.underline}
              onSwitchValueChange={(underline) =>
                onChange({ ...element, underline })
              }
            />
            {hideWhenEmptyCell(element, onChange)}
          </Section>
        </>
      )}

      {element.type === 'image' && (
        <>
          <ImageSourceSection
            layout={layout}
            source={element.source}
            width={element.width}
            onChange={(source, field) =>
              onChange({ ...element, source }, field)
            }
          />
          <Section title={t('app_appearance')}>
            <NumberValueCell
              title={t('app_print_width')}
              value={element.width}
              unit="px"
              min={1}
              max={BASE64.MAX_SIZE}
              onChange={(width) => onChange({ ...element, width })}
            />
            <PickerCell
              title={t('app_image_conversion')}
              value={element.imageType}
              items={imageTypeItems}
              onChange={(imageType) => onChange({ ...element, imageType })}
            />
            <PickerCell
              title={t('app_alignment')}
              value={element.alignment}
              items={alignmentItems}
              onChange={(alignment) => onChange({ ...element, alignment })}
            />
            {hideWhenEmptyCell(element, onChange)}
          </Section>
        </>
      )}

      {element.type === 'qrcode' && (
        <>
          <TextSourceSection
            title={t('app_content')}
            layout={layout}
            source={element.source}
            onChange={(source, field) =>
              onChange({ ...element, source }, field)
            }
          />
          <Section title={t('app_appearance')}>
            <NumberValueCell
              title={t('app_size')}
              value={element.moduleSize}
              min={1}
              max={16}
              onChange={(moduleSize) => onChange({ ...element, moduleSize })}
            />
            <PickerCell
              title={t('app_error_correction_level')}
              value={element.errorLevel}
              items={errorLevelItems}
              onChange={(errorLevel) => onChange({ ...element, errorLevel })}
            />
            <PickerCell
              title={t('app_alignment')}
              value={element.alignment}
              items={alignmentItems}
              onChange={(alignment) => onChange({ ...element, alignment })}
            />
            {hideWhenEmptyCell(element, onChange)}
          </Section>
        </>
      )}

      {element.type === 'columns' &&
        element.columns.map((column, index) => (
          <View key={`column-${element.id}-${index}`}>
            <TextSourceSection
              title={t('app_column_value', index + 1)}
              layout={layout}
              source={column.source}
              onChange={(source, field) =>
                onChange(
                  {
                    ...element,
                    columns: element.columns.map((value, i) =>
                      i === index ? { ...value, source } : value,
                    ),
                  },
                  field,
                )
              }
            />
            <Section>
              <NumberValueCell
                title={t('app_column_value_width', index + 1)}
                value={column.width}
                unit={t('app_text')}
                min={1}
                max={48}
                onChange={(width) =>
                  onChange({
                    ...element,
                    columns: element.columns.map((value, i) =>
                      i === index ? { ...value, width } : value,
                    ),
                  })
                }
              />
              <PickerCell
                title={t('app_column_value_alignment', index + 1)}
                value={column.alignment}
                items={alignmentItems}
                onChange={(alignment) =>
                  onChange({
                    ...element,
                    columns: element.columns.map((value, i) =>
                      i === index ? { ...value, alignment } : value,
                    ),
                  })
                }
              />
            </Section>
          </View>
        ))}

      {element.type === 'columns' && (
        <Section title={t('app_columns')}>
          <Cell
            title={t('app_add_a_column')}
            onPress={() =>
              onChange({
                ...element,
                columns: [
                  ...element.columns,
                  {
                    source: { kind: 'static', value: '' },
                    width: 10,
                    alignment: 'left',
                  },
                ],
              })
            }
          />
          {element.columns.length > 1 && (
            <Cell
              title={t('app_remove_the_last_column')}
              onPress={() =>
                onChange({
                  ...element,
                  columns: element.columns.slice(0, -1),
                })
              }
            />
          )}
          {hideWhenEmptyCell(element, onChange)}
        </Section>
      )}

      {element.type === 'divider' && (
        <Section title={t('app_appearance')}>
          <PickerCell
            title={t('app_line_style')}
            value={element.barType}
            items={barTypeItems}
            onChange={(barType) => onChange({ ...element, barType })}
          />
        </Section>
      )}

      {element.type === 'spacer' && (
        <Section title={t('app_appearance')}>
          <NumberValueCell
            title={t('app_blank_lines')}
            value={element.lines}
            unit={t('app_lines')}
            min={1}
            max={20}
            onChange={(lines) => onChange({ ...element, lines })}
          />
        </Section>
      )}

      {element.type === 'timestamp' && (
        <Section title={t('app_appearance')}>
          <PickerCell
            title={t('app_date_format')}
            value={element.format}
            items={timestampFormatItems}
            onChange={(format) => onChange({ ...element, format })}
          />
          <TextValueCell
            title={t('app_enter_a_custom_format')}
            value={element.format}
            dialogDescription={t('app_use_dayjs_date_format_tokens')}
            onChange={(format) => onChange({ ...element, format })}
          />
          <PickerCell
            title={t('app_alignment')}
            value={element.alignment}
            items={alignmentItems}
            onChange={(alignment) => onChange({ ...element, alignment })}
          />
        </Section>
      )}

      <Section title={t('app_actions')}>
        <Cell title={t('app_delete_this_element')} onPress={onDelete} />
      </Section>
    </SafeScrollView>
  )
}

const Container: React.FC<Props> = (props) => {
  const t = useLocalization()

  const navigation = useNavigation()
  const dispatch = useDispatch()

  const {
    params: { layoutId, elementId },
  } = useRoute<ParamsProps>()

  const selector = useMemo(() => selectLayoutById(layoutId), [layoutId])
  const layout = useSelector(selector)
  const element = layout?.elements.find(({ id }) => id === elementId)

  useLayoutEffect(() => {
    navigation.setOptions({
      title: element ? describeElementType(element.type) : t('app_element'),
    })
  }, [t, navigation, element])

  const onChange = useCallback(
    (next: LayoutElement, field?: LayoutField) => {
      if (!layout) {
        return
      }
      const base = field ? upsertField(layout, field) : layout
      dispatch(saveLayout(replaceElement(base, next)))
    },
    [dispatch, layout],
  )

  const onDelete = useCallback(async () => {
    if (!layout || !element) {
      return
    }
    try {
      const confirmed = await AlertAsync(
        t('app_confirm'),
        t('app_delete_the_value_element', describeElementType(element.type)),
        [
          { text: MESSAGE.NO, onPress: () => false, style: 'cancel' },
          { text: MESSAGE.YES, onPress: () => true },
        ],
      )
      if (confirmed) {
        dispatch(saveLayout(removeElement(layout, element.id)))
        navigation.goBack()
      }
    } catch (e: any) {
      console.warn('onDelete', e)
      dispatch(
        enqueueSnackbar({ message: t('app_could_not_delete_the_element') }),
      )
    }
  }, [t, dispatch, element, layout, navigation])

  return <Component {...props} {...{ layout, element, onChange, onDelete }} />
}

export { Container as ElementEditor }

const useStyles = makeStyles(useColorScheme, (colorScheme) => {
  const styles = StyleSheet.create({
    scrollView: styleType<ViewStyle>({
      flex: 1,
    }),
    empty: styleType<ViewStyle>({
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    }),
    emptyText: styleType<TextStyle>({
      color: COLOR(colorScheme).TEXT.SECONDARY,
    }),
  })
  return styles
})
