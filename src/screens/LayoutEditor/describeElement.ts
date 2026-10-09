import { quantity, t } from '@/localization'
import type {
  Layout,
  LayoutElement,
  LayoutElementType,
  TextSource,
} from '@/print'

const typeLabels: Record<LayoutElementType, string> = {
  get text() {
    return t('app_text_e5cdbf')
  },
  get image() {
    return t('app_image')
  },
  get qrcode() {
    return t('app_qr_code')
  },
  get columns() {
    return t('app_columns')
  },
  get divider() {
    return t('app_divider')
  },
  get spacer() {
    return t('app_blank_space')
  },
  get timestamp() {
    return t('app_print_timestamp')
  },
}

/**
 * 要素の種類の表示名
 */
export const describeElementType = (type: LayoutElementType): string =>
  typeLabels[type]

/**
 * 追加できる要素の種類（一覧の表示順）
 */
export const addableElementTypes: LayoutElementType[] = [
  'text',
  'image',
  'qrcode',
  'columns',
  'divider',
  'spacer',
  'timestamp',
]

const barTypeLabels: Record<string, string> = {
  get line() {
    return t('app_solid_line')
  },
  get double() {
    return t('app_double_line')
  },
  get dots() {
    return t('app_dotted_line')
  },
  get wave() {
    return t('app_wavy_line')
  },
  get plus() {
    return t('app_plus_signs')
  },
  get star() {
    return t('app_stars')
  },
}

const describeTextSource = (source: TextSource, layout: Layout): string => {
  if (source.kind === 'static') {
    return source.value.trim() === '' ? t('app_empty') : source.value
  }
  const field = layout.fields.find(({ id }) => id === source.fieldId)
  return field ? `［${field.label || field.key}］` : t('app_missing_field')
}

/**
 * 一覧で要素の中身を1行で伝える
 */
export const describeElement = (
  element: LayoutElement,
  layout: Layout,
): string => {
  switch (element.type) {
    case 'text':
      return describeTextSource(element.source, layout)
    case 'image':
      if (element.source.kind === 'field') {
        return describeTextSource(element.source, layout)
      }
      return element.source.asset
        ? t('app_width_valuepx', element.width)
        : t('app_no_image_selected')
    case 'qrcode':
      return describeTextSource(element.source, layout)
    case 'columns':
      return element.columns
        .map((column) => describeTextSource(column.source, layout))
        .join(' / ')
    case 'divider':
      return barTypeLabels[element.barType] ?? element.barType
    case 'spacer':
      return quantity('app_value_lines', element.lines, element.lines)
    case 'timestamp':
      return element.format
  }
}
