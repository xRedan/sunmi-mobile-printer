import { useNavigation } from '@react-navigation/native'
import type React from 'react'
import { useCallback, useLayoutEffect, useMemo } from 'react'
import { StyleSheet, type ViewStyle } from 'react-native'
import { getBuildNumber, getVersion } from 'react-native-device-info'
import { makeStyles } from 'react-native-swag-styles'
import { useDispatch } from 'react-redux'
import { Cell, Section } from '@/components/List'
import { SafeScrollView } from '@/components/SafeScrollView'
import { ossLicenses } from '@/licenses'
import { quantity, useLocalization } from '@/localization'
import { openWeb } from '@/redux/modules/inAppWebBrowser/slice'
import { styleType } from '@/utils/styles'

const REPOSITORY_URL = 'https://github.com/mitsuharu/mobile-printer'
const ISSUES_URL = `${REPOSITORY_URL}/issues`

type Props = {}
type ComponentProps = Props & {
  appName: string
  version: string
  licenseCount: number
  onPressGuide: () => void
  onPressLicenses: () => void
  onPressRepository: () => void
  onPressIssues: () => void
}

const Component: React.FC<ComponentProps> = ({
  appName,
  version,
  licenseCount,
  onPressGuide,
  onPressLicenses,
  onPressRepository,
  onPressIssues,
}) => {
  const t = useLocalization()

  const styles = useStyles()

  return (
    <SafeScrollView style={styles.scrollView}>
      <Section title={t('app_user_guide')}>
        <Cell
          title={t('app_how_to_use_this_app')}
          description={t(
            'app_quick_printing_layout_printing_and_creating_layouts',
          )}
          accessory="disclosure"
          onPress={onPressGuide}
        />
      </Section>
      <Section title={t('app_app')}>
        <Cell title={t('app_field_name')} description={appName} />
        <Cell title={t('app_version')} description={version} />
      </Section>
      <Section title={t('app_open_source_licenses')}>
        <Cell
          title={t('app_software_used_by_this_app')}
          description={quantity(
            'app_value_packages',
            licenseCount,
            licenseCount,
          )}
          accessory="disclosure"
          onPress={onPressLicenses}
        />
      </Section>
      <Section title={t('app_links')}>
        <Cell
          title={t('app_source_code')}
          description="mitsuharu/mobile-printer"
          accessory="link"
          onPress={onPressRepository}
        />
        <Cell
          title={t('app_report_an_issue')}
          description={t(
            'app_report_errors_or_unexpected_behavior_through_github_issues',
          )}
          accessory="link"
          onPress={onPressIssues}
        />
      </Section>
    </SafeScrollView>
  )
}

const Container: React.FC<Props> = (props) => {
  const t = useLocalization()

  const navigation = useNavigation()
  const dispatch = useDispatch()

  const appName = t('app_name')
  const version = useMemo(() => `${getVersion()} (${getBuildNumber()})`, [])
  const licenseCount = useMemo(() => ossLicenses.length, [])

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('app_about_this_app') })
  }, [t, navigation])

  const onPressGuide = useCallback(() => {
    navigation.navigate('Guide')
  }, [navigation])

  const onPressLicenses = useCallback(() => {
    navigation.navigate('Licenses')
  }, [navigation])

  const onPressRepository = useCallback(() => {
    dispatch(openWeb(REPOSITORY_URL))
  }, [dispatch])

  const onPressIssues = useCallback(() => {
    dispatch(openWeb(ISSUES_URL))
  }, [dispatch])

  return (
    <Component
      {...props}
      {...{
        appName,
        version,
        licenseCount,
        onPressGuide,
        onPressLicenses,
        onPressRepository,
        onPressIssues,
      }}
    />
  )
}

export { Container as AppInfo }

const useStyles = makeStyles(() => {
  const styles = StyleSheet.create({
    scrollView: styleType<ViewStyle>({
      flex: 1,
    }),
  })
  return styles
})
