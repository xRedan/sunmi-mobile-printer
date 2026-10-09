import type {
  Alignment,
  BarType,
  PrintImageType,
  QRErrorLevel,
} from '@mitsuharu/react-native-sunmi-printer-library'
import { FONT_SIZE } from '@/CONSTANTS'
import type { ListPickerItem } from '@/components/Modal/ListPickerModal'
import { t } from '@/localization'
import type { FieldValueType } from '@/print'

export const alignmentItems: ListPickerItem<Alignment>[] = [
  {
    value: 'left',
    get title() {
      return t('app_left')
    },
  },
  {
    value: 'center',
    get title() {
      return t('app_center')
    },
  },
  {
    value: 'right',
    get title() {
      return t('app_right')
    },
  },
]

export const fontSizeItems: ListPickerItem<number>[] = [
  {
    value: FONT_SIZE.DEFAULT,
    get title() {
      return t('app_default')
    },
    description: `${FONT_SIZE.DEFAULT}px`,
  },
  {
    value: FONT_SIZE.LARGE,
    get title() {
      return t('app_large')
    },
    description: `${FONT_SIZE.LARGE}px`,
  },
]

export const imageTypeItems: ListPickerItem<PrintImageType>[] = [
  {
    value: 'binary',
    get title() {
      return t('app_black_and_white')
    },
    get description() {
      return t('app_print_using_a_black_and_white_threshold')
    },
  },
  {
    value: 'grayscale',
    get title() {
      return t('app_grayscale')
    },
  },
]

export const barTypeItems: ListPickerItem<BarType>[] = [
  {
    value: 'line',
    get title() {
      return t('app_solid_line')
    },
  },
  {
    value: 'double',
    get title() {
      return t('app_double_line')
    },
  },
  {
    value: 'dots',
    get title() {
      return t('app_dotted_line')
    },
  },
  {
    value: 'wave',
    get title() {
      return t('app_wavy_line')
    },
  },
  {
    value: 'plus',
    get title() {
      return t('app_plus_signs')
    },
  },
  {
    value: 'star',
    get title() {
      return t('app_stars')
    },
  },
]

export const errorLevelItems: ListPickerItem<QRErrorLevel>[] = [
  {
    value: 'low',
    get title() {
      return t('app_low')
    },
    get description() {
      return t('app_allows_more_data')
    },
  },
  {
    value: 'middle',
    get title() {
      return t('app_medium')
    },
  },
  {
    value: 'quartile',
    get title() {
      return t('app_quartile')
    },
  },
  {
    value: 'high',
    get title() {
      return t('app_high')
    },
    get description() {
      return t('app_more_resistant_to_damage')
    },
  },
]

export const fieldValueTypeItems: ListPickerItem<FieldValueType>[] = [
  {
    value: 'text',
    get title() {
      return t('app_text_e5cdbf')
    },
  },
  {
    value: 'multilineText',
    get title() {
      return t('app_multiline_text')
    },
  },
  { value: 'url', title: 'URL' },
  {
    value: 'image',
    get title() {
      return t('app_image')
    },
  },
]

export const timestampFormatItems: ListPickerItem<string>[] = [
  {
    value: 'YYYY/MM/DD HH:mm',
    get title() {
      return t('app_date_and_time')
    },
    description: '2026/09/07 22:34',
  },
  {
    value: 'YYYY/MM/DD',
    get title() {
      return t('app_date')
    },
    description: '2026/09/07',
  },
  {
    value: 'HH:mm',
    get title() {
      return t('app_time')
    },
    description: '22:34',
  },
  {
    value: 'YYYY/MM/DD HH:mm:ss',
    get title() {
      return t('app_include_seconds')
    },
    description: '2026/09/07 22:34:00',
  },
]
