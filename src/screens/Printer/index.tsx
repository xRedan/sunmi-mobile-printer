import { useNavigation } from '@react-navigation/native'
import type React from 'react'
import { useCallback, useLayoutEffect } from 'react'
import { ScrollView, StyleSheet, type ViewStyle } from 'react-native'
import { makeStyles } from 'react-native-swag-styles'
import { useDispatch, useSelector } from 'react-redux'
import { Cell, Section } from '@/components/List'
import { useLocalization } from '@/localization'
import { selectNfcIsSupported } from '@/redux/modules/nfc/selectors'
import { startReadingNfc } from '@/redux/modules/nfc/slice'
import {
  duplicateQRCode,
  printImageFromImagePicker,
  printQRCode,
  printText,
} from '@/redux/modules/printer/slice'
import { styleType } from '@/utils/styles'
import { InputDialogCell } from './InputDialogCell'

type Props = {}
type ComponentProps = Props & {
  onPressText: (text: string) => void
  onPressImageBinary: () => void
  onPressImageGrayscale: () => void
  onPressQRCode: (text: string) => void
  onPressDuplicateQRCode: () => void
  isNfcSupported: boolean
  onPressNfc: () => void
}

const Component: React.FC<ComponentProps> = ({
  onPressText,
  onPressImageBinary,
  onPressImageGrayscale,
  onPressQRCode,
  onPressDuplicateQRCode,
  isNfcSupported,
  onPressNfc,
}) => {
  const t = useLocalization()

  const styles = useStyles()

  return (
    <ScrollView style={styles.scrollView}>
      <Section title={t('app_text_e5cdbf')}>
        <InputDialogCell
          title={t('app_print_text')}
          dialogTitle={t('app_text_printing')}
          dialogDescription={t('app_enter_the_text_to_print')}
          onSelectText={onPressText}
        />
      </Section>
      <Section title={t('app_image')}>
        <Cell
          title={t('app_print_image_in_black_and_white')}
          onPress={onPressImageBinary}
        />
        <Cell
          title={t('app_print_image_in_grayscale')}
          onPress={onPressImageGrayscale}
        />
      </Section>
      <Section title={t('app_qr_code')}>
        <InputDialogCell
          title={t('app_print_qr_code')}
          dialogTitle={t('app_qr_code_printing')}
          dialogDescription={t('app_enter_the_text_to_encode_as_a_qr_code')}
          onSelectText={onPressQRCode}
        />
        <Cell
          title={t('app_copy_a_qr_code')}
          onPress={onPressDuplicateQRCode}
        />
      </Section>
      {isNfcSupported && (
        <Section title={t('app_nfc_tags')}>
          <Cell title={t('app_copy_nfc_tag_content')} onPress={onPressNfc} />
        </Section>
      )}
    </ScrollView>
  )
}

const Container: React.FC<Props> = (props) => {
  const t = useLocalization()

  const navigation = useNavigation()
  const dispatch = useDispatch()

  const isNfcSupported = useSelector(selectNfcIsSupported)

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('app_quick_print'),
    })
  }, [t, navigation])

  const onPressText = useCallback(
    (text: string) => {
      dispatch(printText({ text: text, size: 'default' }))
    },
    [dispatch],
  )

  const onPressImageBinary = useCallback(() => {
    dispatch(printImageFromImagePicker('binary'))
  }, [dispatch])

  const onPressImageGrayscale = useCallback(() => {
    dispatch(printImageFromImagePicker('grayscale'))
  }, [dispatch])

  const onPressQRCode = useCallback(
    (text: string) => {
      dispatch(printQRCode({ text }))
    },
    [dispatch],
  )

  const onPressDuplicateQRCode = useCallback(() => {
    dispatch(duplicateQRCode())
  }, [dispatch])

  const onPressNfc = useCallback(() => {
    dispatch(startReadingNfc())
  }, [dispatch])

  return (
    <Component
      {...props}
      {...{
        onPressText,
        onPressImageBinary,
        onPressImageGrayscale,
        onPressQRCode,
        onPressDuplicateQRCode,
        isNfcSupported,
        onPressNfc,
      }}
    />
  )
}

export { Container as Printer }

const useStyles = makeStyles(() => {
  const styles = StyleSheet.create({
    scrollView: styleType<ViewStyle>({
      flex: 1,
    }),
  })
  return styles
})
