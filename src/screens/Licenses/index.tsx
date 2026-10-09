import { useNavigation } from '@react-navigation/native'
import type React from 'react'
import { useCallback, useLayoutEffect } from 'react'
import {
  FlatList,
  type ListRenderItem,
  StyleSheet,
  type ViewStyle,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { makeStyles } from 'react-native-swag-styles'
import { Cell, ItemSeparator, SectionHeader } from '@/components/List'
import { type OssLicense, ossLicenseId, ossLicenses } from '@/licenses'
import { quantity, useLocalization } from '@/localization'
import { styleType } from '@/utils/styles'

type Props = {}
type ComponentProps = Props & {
  licenses: OssLicense[]
  onPressLicense: (license: OssLicense) => void
}

const keyExtractor = (license: OssLicense) => ossLicenseId(license)

const Component: React.FC<ComponentProps> = ({ licenses, onPressLicense }) => {
  const t = useLocalization()

  const styles = useStyles()

  const renderItem = useCallback<ListRenderItem<OssLicense>>(
    ({ item }) => (
      <Cell
        title={item.name}
        description={t('app_value_value', item.version, item.license)}
        accessory="disclosure"
        onPress={() => onPressLicense(item)}
      />
    ),
    [t, onPressLicense],
  )

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={licenses}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={ItemSeparator}
        ListHeaderComponent={
          <SectionHeader
            title={quantity(
              'app_this_app_uses_value_software_packages',
              licenses.length,
              licenses.length,
            )}
          />
        }
      />
    </SafeAreaView>
  )
}

const Container: React.FC<Props> = (props) => {
  const t = useLocalization()

  const navigation = useNavigation()

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('app_open_source_licenses') })
  }, [t, navigation])

  const onPressLicense = useCallback(
    (license: OssLicense) => {
      navigation.navigate('LicenseDetail', { licenseId: ossLicenseId(license) })
    },
    [navigation],
  )

  return <Component {...props} {...{ licenses: ossLicenses, onPressLicense }} />
}

export { Container as Licenses }

const useStyles = makeStyles(() => {
  const styles = StyleSheet.create({
    container: styleType<ViewStyle>({
      flex: 1,
    }),
  })
  return styles
})
