import {
  type RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native'
import type React from 'react'
import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
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
import { COLOR, ICON, MESSAGE } from '@/CONSTANTS'
import { InputDialog } from '@/components/Dialog'
import { Cell, Section } from '@/components/List'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import {
  type ListPickerItem,
  ListPickerModal,
} from '@/components/Modal/ListPickerModal'
import { SafeScrollView } from '@/components/SafeScrollView'
import { t, useLocalization } from '@/localization'
import type { Layout, PrintData } from '@/print'
import { createPrintData } from '@/print'
import { selectLayoutById } from '@/redux/modules/layout/selectors'
import {
  selectPrintDataByLayoutId,
  selectPrintDataIsLoading,
} from '@/redux/modules/printData/selectors'
import {
  deletePrintData,
  duplicatePrintData,
  printLayout,
  savePrintData,
} from '@/redux/modules/printData/slice'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import type { MainParams } from '@/routes/main.params'
import { formatDateTime } from '@/utils/day'
import { styleType } from '@/utils/styles'

type ParamsProps = RouteProp<MainParams, 'PrintDataList'>

/**
 * 印刷データを長押ししたときに選べる操作
 */
type PrintDataAction = 'print' | 'duplicate' | 'delete'

const printDataActions: ListPickerItem<PrintDataAction>[] = [
  {
    value: 'print',
    get title() {
      return t('app_print')
    },
  },
  {
    value: 'duplicate',
    get title() {
      return t('app_duplicate')
    },
  },
  {
    value: 'delete',
    get title() {
      return t('app_delete')
    },
  },
]

type Props = {}
type ComponentProps = Props & {
  isLoading: boolean
  layout: Layout | undefined
  printData: PrintData[]
  isDialogVisible: boolean
  actionTarget: PrintData | undefined
  onPressPrintData: (value: PrintData) => void
  onLongPressPrintData: (value: PrintData) => void
  onSelectAction: (action: PrintDataAction) => void
  onCancelAction: () => void
  onPressAdd: () => void
  onSubmitTitle: (title: string) => void
  onCancelDialog: () => void
}

const Component: React.FC<ComponentProps> = ({
  isLoading,
  layout,
  printData,
  isDialogVisible,
  actionTarget,
  onPressPrintData,
  onLongPressPrintData,
  onSelectAction,
  onCancelAction,
  onPressAdd,
  onSubmitTitle,
  onCancelDialog,
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
    <>
      <SafeScrollView style={styles.scrollView}>
        <Section title={t('app_print_data')}>
          {printData.length === 0 ? (
            <Cell
              title={t('app_no_print_data')}
              description={t('app_tap_add_print_data_below_to_create_a_record')}
              inactive={true}
            />
          ) : (
            printData.map((value) => (
              <Cell
                key={value.id}
                title={value.title}
                description={formatDateTime(value.updatedAt)}
                icon={ICON.PRINT_DATA}
                accessory="disclosure"
                onPress={() => onPressPrintData(value)}
                onLongPress={() => onLongPressPrintData(value)}
              />
            ))
          )}
        </Section>
        <Section title={t('app_actions')}>
          <Cell
            title={t('app_add_print_data')}
            description={
              layout.fields.length === 0
                ? t('app_this_layout_has_no_input_fields_to_fill_in')
                : t('app_press_and_hold_a_row_to_print_duplicate_or')
            }
            onPress={onPressAdd}
          />
        </Section>
      </SafeScrollView>
      <LoadingSpinner isLoading={isLoading} />
      <InputDialog
        isVisible={isDialogVisible}
        title={t('app_add_print_data_c32038')}
        description={t('app_enter_a_print_record_name')}
        onPress={onSubmitTitle}
        onCancel={onCancelDialog}
      />
      <ListPickerModal
        visible={!!actionTarget}
        title={actionTarget?.title ?? ''}
        description={t('app_choose_an_action')}
        items={printDataActions}
        onSelect={onSelectAction}
        onCancel={onCancelAction}
      />
    </>
  )
}

const Container: React.FC<Props> = (props) => {
  const t = useLocalization()

  const navigation = useNavigation()
  const dispatch = useDispatch()

  const {
    params: { layoutId },
  } = useRoute<ParamsProps>()

  const layoutSelector = useMemo(() => selectLayoutById(layoutId), [layoutId])
  const printDataSelector = useMemo(
    () => selectPrintDataByLayoutId(layoutId),
    [layoutId],
  )
  const layout = useSelector(layoutSelector)
  const printData = useSelector(printDataSelector)
  const isLoading = useSelector(selectPrintDataIsLoading)

  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false)
  const [actionTarget, setActionTarget] = useState<PrintData | undefined>(
    undefined,
  )

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('app_print_data') })
  }, [t, navigation])

  const onPressPrintData = useCallback(
    (value: PrintData) => {
      navigation.navigate('PrintDataForm', {
        layoutId,
        printDataId: value.id,
      })
    },
    [layoutId, navigation],
  )

  const onLongPressPrintData = useCallback((value: PrintData) => {
    setActionTarget(value)
  }, [])

  const onCancelAction = useCallback(() => {
    setActionTarget(undefined)
  }, [])

  const onSelectAction = useCallback(
    async (action: PrintDataAction) => {
      const value = actionTarget
      setActionTarget(undefined)
      if (!value) {
        return
      }
      try {
        if (action === 'print') {
          dispatch(printLayout({ layoutId, printDataId: value.id }))
          return
        }

        if (action === 'duplicate') {
          dispatch(duplicatePrintData(value))
          return
        }

        if (action === 'delete') {
          const confirmed = await AlertAsync(
            t('app_confirm'),
            t('app_delete_value', value.title),
            [
              { text: MESSAGE.NO, onPress: () => false, style: 'cancel' },
              { text: MESSAGE.YES, onPress: () => true },
            ],
          )
          if (confirmed) {
            dispatch(deletePrintData(value))
          }
        }
      } catch (e: any) {
        console.warn('onSelectAction', e)
        dispatch(
          enqueueSnackbar({ message: t('app_could_not_complete_the_action') }),
        )
      }
    },
    [t, actionTarget, dispatch, layoutId],
  )

  const onPressAdd = useCallback(() => setIsDialogVisible(true), [])
  const onCancelDialog = useCallback(() => setIsDialogVisible(false), [])

  const onSubmitTitle = useCallback(
    (title: string) => {
      setIsDialogVisible(false)
      const value = createPrintData(
        layoutId,
        title.trim() || t('app_new_print_record'),
      )
      dispatch(savePrintData(value))
      navigation.navigate('PrintDataForm', {
        layoutId,
        printDataId: value.id,
      })
    },
    [t, dispatch, layoutId, navigation],
  )

  return (
    <Component
      {...props}
      {...{
        isLoading,
        layout,
        printData,
        isDialogVisible,
        actionTarget,
        onPressPrintData,
        onLongPressPrintData,
        onSelectAction,
        onCancelAction,
        onPressAdd,
        onSubmitTitle,
        onCancelDialog,
      }}
    />
  )
}

export { Container as PrintDataList }

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
