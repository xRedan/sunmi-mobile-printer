import {
  type RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native'
import type React from 'react'
import { useLayoutEffect, useMemo, useState } from 'react'
import {
  type LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  type TextStyle,
  useColorScheme,
  View,
  type ViewStyle,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { makeStyles } from 'react-native-swag-styles'
import { useSelector } from 'react-redux'
import { BASE64, COLOR } from '@/CONSTANTS'
import { createPreviewPrintData, PrintPreview } from '@/components/PrintPreview'
import { useLocalization } from '@/localization'
import type { Layout, PrintCommand, PrintData } from '@/print'
import { buildPrintCommands } from '@/print'
import { selectLayoutById } from '@/redux/modules/layout/selectors'
import { selectPrintDataById } from '@/redux/modules/printData/selectors'
import { selectPrinterInfo } from '@/redux/modules/printer/selectors'
import type { MainParams } from '@/routes/main.params'
import { styleType } from '@/utils/styles'

type ParamsProps = RouteProp<MainParams, 'LayoutPreview'>

/**
 * プレビューの左右の余白
 */
const HORIZONTAL_PADDING = 16

type Props = {}
type ComponentProps = Props & {
  layout: Layout | undefined
  isPlaceholder: boolean
  commands: PrintCommand[]
  paperPixelWidth: number
  scale: number
  onLayout: (event: LayoutChangeEvent) => void
}

const Component: React.FC<ComponentProps> = ({
  layout,
  isPlaceholder,
  commands,
  paperPixelWidth,
  scale,
  onLayout,
}) => {
  const t = useLocalization()

  const styles = useStyles()

  if (!layout) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{t('app_layout_not_found_31b6c4')}</Text>
      </View>
    )
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={['bottom']}
      onLayout={onLayout}
    >
      <Text style={styles.notice}>
        {t('app_this_is_an_on_screen_preview_fonts_and_line_7840d5')}
      </Text>
      <Text style={styles.description}>
        {t('app_paper_width')}
        {paperPixelWidth}
        {t('app_px')}
        {isPlaceholder
          ? t('app_input_fields_use_their_display_names_as_placeholder_values')
          : null}
      </Text>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {commands.length === 0 ? (
          <Text style={styles.emptyText}>
            {t('app_there_is_nothing_to_print_34b443')}
          </Text>
        ) : (
          <View
            style={{
              width: paperPixelWidth * scale,
              // 縮小したぶん高さが余るため、原点を左上に固定して詰める
              transform: [{ scale }],
              transformOrigin: 'top left',
            }}
          >
            <PrintPreview
              commands={commands}
              paperPixelWidth={paperPixelWidth}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const Container: React.FC<Props> = (props) => {
  const t = useLocalization()

  const navigation = useNavigation()

  const {
    params: { layoutId, printDataId },
  } = useRoute<ParamsProps>()

  const layoutSelector = useMemo(() => selectLayoutById(layoutId), [layoutId])
  const printDataSelector = useMemo(
    () => selectPrintDataById(printDataId),
    [printDataId],
  )
  const layout = useSelector(layoutSelector)
  const printData: PrintData | undefined = useSelector(printDataSelector)
  const printerInfo = useSelector(selectPrinterInfo)

  const paperPixelWidth = printerInfo?.pixelWidth ?? BASE64.MAX_SIZE

  const [availableWidth, setAvailableWidth] = useState<number>(0)

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('app_preview') })
  }, [t, navigation])

  const commands = useMemo(() => {
    if (!layout) {
      return []
    }
    // 印刷データを指定されていなければ、入力項目へ仮の値を入れて体裁を見せる
    return buildPrintCommands(
      layout,
      printData ?? createPreviewPrintData(layout),
    )
  }, [layout, printData])

  const scale = useMemo(() => {
    const usable = availableWidth - HORIZONTAL_PADDING * 2
    if (usable <= 0) {
      return 1
    }
    return Math.min(1, usable / paperPixelWidth)
  }, [availableWidth, paperPixelWidth])

  const onLayout = (event: LayoutChangeEvent) => {
    setAvailableWidth(event.nativeEvent.layout.width)
  }

  return (
    <Component
      {...props}
      {...{
        layout,
        isPlaceholder: !printData,
        commands,
        paperPixelWidth,
        scale,
        onLayout,
      }}
    />
  )
}

export { Container as LayoutPreview }

const useStyles = makeStyles(useColorScheme, (colorScheme) => {
  const styles = StyleSheet.create({
    container: styleType<ViewStyle>({
      flex: 1,
    }),
    contentContainer: styleType<ViewStyle>({
      padding: HORIZONTAL_PADDING,
      alignItems: 'flex-start',
    }),
    notice: styleType<TextStyle>({
      paddingHorizontal: HORIZONTAL_PADDING,
      paddingTop: 12,
      fontSize: 12,
      fontWeight: 'bold',
      color: COLOR(colorScheme).TEXT.PRIMARY,
    }),
    description: styleType<TextStyle>({
      paddingHorizontal: HORIZONTAL_PADDING,
      paddingTop: 4,
      fontSize: 12,
      color: COLOR(colorScheme).TEXT.SECONDARY,
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
