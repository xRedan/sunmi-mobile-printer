import { useNavigation } from '@react-navigation/native'
import type React from 'react'
import { useCallback, useLayoutEffect, useState } from 'react'
import { StyleSheet, type ViewStyle } from 'react-native'
import AlertAsync from 'react-native-alert-async'
import { makeStyles } from 'react-native-swag-styles'
import { useDispatch, useSelector } from 'react-redux'
import { ICON, MESSAGE } from '@/CONSTANTS'
import { InputDialog } from '@/components/Dialog'
import { Cell, Section } from '@/components/List'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { SafeScrollView } from '@/components/SafeScrollView'
import { quantity, useLocalization } from '@/localization'
import type { Layout } from '@/print'
import { createLayout } from '@/print'
import {
  selectLayoutIsLoading,
  selectLayouts,
} from '@/redux/modules/layout/selectors'
import {
  deleteLayout,
  duplicateLayout,
  saveLayout,
} from '@/redux/modules/layout/slice'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import { formatDateTime } from '@/utils/day'
import { styleType } from '@/utils/styles'

type Props = {}
type ComponentProps = Props & {
  isLoading: boolean
  layouts: Layout[]
  isDialogVisible: boolean
  onPressLayout: (layout: Layout) => void
  onLongPressLayout: (layout: Layout) => void
  onPressAdd: () => void
  onSubmitName: (name: string) => void
  onCancelDialog: () => void
}

const Component: React.FC<ComponentProps> = ({
  isLoading,
  layouts,
  isDialogVisible,
  onPressLayout,
  onLongPressLayout,
  onPressAdd,
  onSubmitName,
  onCancelDialog,
}) => {
  const t = useLocalization()

  const styles = useStyles()

  return (
    <>
      <SafeScrollView style={styles.scrollView}>
        <Section title={t('app_layout')}>
          {layouts.length === 0 ? (
            <Cell
              title={t('app_no_layouts')}
              description={t('app_tap_add_a_layout_below_to_create_one')}
              inactive={true}
            />
          ) : (
            layouts.map((layout) => (
              <Cell
                key={layout.id}
                title={layout.name}
                description={quantity(
                  'app_value_elements_value',
                  layout.elements.length,
                  layout.elements.length,
                  formatDateTime(layout.updatedAt),
                )}
                icon={ICON.LAYOUT}
                accessory="disclosure"
                onPress={() => onPressLayout(layout)}
                onLongPress={() => onLongPressLayout(layout)}
              />
            ))
          )}
        </Section>
        <Section title={t('app_actions')}>
          <Cell
            title={t('app_add_a_layout')}
            description={t('app_press_and_hold_a_row_to_duplicate_or_delete')}
            onPress={onPressAdd}
          />
        </Section>
      </SafeScrollView>
      <LoadingSpinner isLoading={isLoading} />
      <InputDialog
        isVisible={isDialogVisible}
        title={t('app_add_layout')}
        description={t('app_enter_a_layout_name')}
        onPress={onSubmitName}
        onCancel={onCancelDialog}
      />
    </>
  )
}

const Container: React.FC<Props> = (props) => {
  const t = useLocalization()

  const navigation = useNavigation()
  const dispatch = useDispatch()

  const isLoading = useSelector(selectLayoutIsLoading)
  const layouts = useSelector(selectLayouts)

  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false)

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('app_layout') })
  }, [t, navigation])

  const onPressLayout = useCallback(
    (layout: Layout) => {
      navigation.navigate('LayoutEditor', { layoutId: layout.id })
    },
    [navigation],
  )

  const onLongPressLayout = useCallback(
    async (layout: Layout) => {
      try {
        const action = await AlertAsync(
          layout.name,
          t('app_choose_an_action'),
          [
            { text: t('app_duplicate'), onPress: () => 'duplicate' },
            {
              text: t('app_delete'),
              onPress: () => 'delete',
              style: 'destructive',
            },
            { text: MESSAGE.CANCEL, onPress: () => undefined, style: 'cancel' },
          ],
        )

        if (action === 'duplicate') {
          dispatch(duplicateLayout(layout))
          return
        }

        if (action === 'delete') {
          const confirmed = await AlertAsync(
            t('app_confirm'),
            t(
              'app_delete_value_print_data_for_this_layout_will_also',
              layout.name,
            ),
            [
              { text: MESSAGE.NO, onPress: () => false, style: 'cancel' },
              { text: MESSAGE.YES, onPress: () => true },
            ],
          )
          if (confirmed) {
            dispatch(deleteLayout(layout))
          }
        }
      } catch (e: any) {
        console.warn('onLongPressLayout', e)
        dispatch(
          enqueueSnackbar({ message: t('app_could_not_complete_the_action') }),
        )
      }
    },
    [t, dispatch],
  )

  const onPressAdd = useCallback(() => {
    setIsDialogVisible(true)
  }, [])

  const onSubmitName = useCallback(
    (name: string) => {
      setIsDialogVisible(false)
      dispatch(saveLayout(createLayout(name.trim() || t('app_new_layout'))))
    },
    [t, dispatch],
  )

  const onCancelDialog = useCallback(() => {
    setIsDialogVisible(false)
  }, [])

  return (
    <Component
      {...props}
      {...{
        isLoading,
        layouts,
        isDialogVisible,
        onPressLayout,
        onLongPressLayout,
        onPressAdd,
        onSubmitName,
        onCancelDialog,
      }}
    />
  )
}

export { Container as LayoutList }

const useStyles = makeStyles(() => {
  const styles = StyleSheet.create({
    scrollView: styleType<ViewStyle>({
      flex: 1,
    }),
  })
  return styles
})
