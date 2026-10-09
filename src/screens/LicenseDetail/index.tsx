import {
  type RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native'
import type React from 'react'
import { useCallback, useLayoutEffect, useMemo } from 'react'
import {
  Platform,
  StyleSheet,
  Text,
  type TextStyle,
  useColorScheme,
  View,
  type ViewStyle,
} from 'react-native'
import { makeStyles } from 'react-native-swag-styles'
import { useDispatch } from 'react-redux'
import { COLOR } from '@/CONSTANTS'
import { Cell, Section } from '@/components/List'
import { SafeScrollView } from '@/components/SafeScrollView'
import { findOssLicense, type OssLicense } from '@/licenses'
import { useLocalization } from '@/localization'
import { openWeb } from '@/redux/modules/inAppWebBrowser/slice'
import type { MainParams } from '@/routes/main.params'
import { styleType } from '@/utils/styles'

type Props = {}
type ComponentProps = Props & {
  license: OssLicense | undefined
  onPressHomepage: (url: string) => void
}

const Component: React.FC<ComponentProps> = ({ license, onPressHomepage }) => {
  const t = useLocalization()

  const styles = useStyles()

  if (!license) {
    return (
      <SafeScrollView style={styles.scrollView}>
        <Section title={t('app_license')}>
          <Cell
            title={t('app_license_information_not_found')}
            description={t(
              'app_regenerate_the_list_with_yarn_licenses_generate',
            )}
          />
        </Section>
      </SafeScrollView>
    )
  }

  const { author, homepage, licenseText } = license

  return (
    <SafeScrollView style={styles.scrollView}>
      <Section title={t('app_package')}>
        <Cell title={t('app_version')} description={license.version} />
        <Cell title={t('app_license')} description={license.license} />
        {!!author && <Cell title={t('app_author')} description={author} />}
        {!!homepage && (
          <Cell
            title={t('app_homepage')}
            description={homepage}
            accessory="link"
            onPress={() => onPressHomepage(homepage)}
          />
        )}
      </Section>
      <Section title={t('app_license_text')}>
        <View style={styles.textContainer}>
          {/*
            本文は選択できるようにしない。Androidでは選択できる文字がタッチ
            操作でもフォーカスを取り、ScrollViewがそこまで送ってしまうため、
            画面を開いた直後に上のパッケージ情報が見えなくなる端末がある
            （SUNMI V2 PRO / Android 7.1.2 で再現。V2s では起きない）。
            描画のあとで有効にしても、有効にした時点でフォーカスが移るため
            変わらない。読むための画面なので、選択より位置を優先する。
          */}
          <Text style={styles.text}>
            {licenseText ??
              t('app_this_package_does_not_include_its_license_text_refer')}
          </Text>
        </View>
      </Section>
    </SafeScrollView>
  )
}

const Container: React.FC<Props> = (props) => {
  const t = useLocalization()

  const navigation = useNavigation()
  const dispatch = useDispatch()
  const { params } = useRoute<RouteProp<MainParams, 'LicenseDetail'>>()

  const license = useMemo(
    () => findOssLicense(params.licenseId),
    [params.licenseId],
  )

  useLayoutEffect(() => {
    navigation.setOptions({ title: license?.name ?? t('app_license') })
  }, [t, navigation, license])

  const onPressHomepage = useCallback(
    (url: string) => {
      dispatch(openWeb(url))
    },
    [dispatch],
  )

  return <Component {...props} {...{ license, onPressHomepage }} />
}

export { Container as LicenseDetail }

const useStyles = makeStyles(useColorScheme, (colorScheme) => {
  const styles = StyleSheet.create({
    scrollView: styleType<ViewStyle>({
      flex: 1,
    }),
    textContainer: styleType<ViewStyle>({
      backgroundColor: COLOR(colorScheme).BACKGROUND.PRIMARY,
      paddingVertical: 12,
      paddingHorizontal: 16,
    }),
    text: styleType<TextStyle>({
      color: COLOR(colorScheme).TEXT.PRIMARY,
      fontSize: 12,
      lineHeight: 18,
      fontFamily: Platform.select({ android: 'monospace', default: 'Courier' }),
    }),
  })
  return styles
})
