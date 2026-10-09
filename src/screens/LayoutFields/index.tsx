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
import { COLOR, MESSAGE } from '@/CONSTANTS'
import { InputDialog } from '@/components/Dialog'
import { Cell, Section } from '@/components/List'
import { SafeScrollView } from '@/components/SafeScrollView'
import { useLocalization } from '@/localization'
import type { Layout, LayoutField } from '@/print'
import {
  createLayoutField,
  isFieldReferenced,
  removeField,
  upsertField,
} from '@/print'
import { selectLayoutById } from '@/redux/modules/layout/selectors'
import { saveLayout } from '@/redux/modules/layout/slice'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import type { MainParams } from '@/routes/main.params'
import { styleType } from '@/utils/styles'
import { fieldValueTypeItems } from '../ElementEditor/options'
import { PickerCell, TextValueCell } from '../ElementEditor/rows'

type ParamsProps = RouteProp<MainParams, 'LayoutFields'>

type Props = {}
type ComponentProps = Props & {
  layout: Layout | undefined
  isDialogVisible: boolean
  onChangeField: (field: LayoutField) => void
  onDeleteField: (field: LayoutField) => void
  onPressAdd: () => void
  onSubmitLabel: (label: string) => void
  onCancelDialog: () => void
}

const Component: React.FC<ComponentProps> = ({
  layout,
  isDialogVisible,
  onChangeField,
  onDeleteField,
  onPressAdd,
  onSubmitLabel,
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
        <Text style={styles.description}>
          {t('app_input_fields_contain_values_that_can_vary_between_print')}
        </Text>
        <Section>
          <Cell
            title={t('app_add_an_input_field')}
            description={t('app_you_can_change_the_display_name_key_and_input')}
            onPress={onPressAdd}
          />
        </Section>
        {layout.fields.length === 0 ? (
          <Section title={t('app_input_fields')}>
            <Cell
              title={t('app_no_input_fields')}
              description={t('app_tap_add_an_input_field_above_to_create_one')}
              inactive={true}
            />
          </Section>
        ) : (
          layout.fields.map((field) => (
            <Section
              key={field.id}
              title={
                isFieldReferenced(layout, field.id)
                  ? field.label || field.key
                  : t('app_value_unused', field.label || field.key)
              }
            >
              {/*
                どの要素からも指定されていない項目は、印刷データへ入力しても
                読まれない。作った直後に気づけるよう、ここで理由を出す。
              */}
              {!isFieldReferenced(layout, field.id) && (
                <Cell
                  title={t('app_no_element_references_this_field')}
                  description={t(
                    'app_select_use_an_input_field_under_an_element_s',
                  )}
                  inactive={true}
                />
              )}
              <TextValueCell
                title={t('app_display_name')}
                value={field.label}
                onChange={(label) => onChangeField({ ...field, label })}
              />
              <TextValueCell
                title={t('app_key')}
                value={field.key}
                dialogDescription={t(
                  'app_the_identifier_that_links_this_field_to_print_data',
                )}
                onChange={(key) => onChangeField({ ...field, key })}
              />
              <PickerCell
                title={t('app_input_type')}
                value={field.valueType}
                items={fieldValueTypeItems}
                onChange={(valueType) => onChangeField({ ...field, valueType })}
              />
              <Cell
                title={t('app_delete_this_input_field')}
                onPress={() => onDeleteField(field)}
              />
            </Section>
          ))
        )}
      </SafeScrollView>
      <InputDialog
        isVisible={isDialogVisible}
        title={t('app_add_input_field')}
        description={t('app_enter_a_display_name')}
        onPress={onSubmitLabel}
        onCancel={onCancelDialog}
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

  const selector = useMemo(() => selectLayoutById(layoutId), [layoutId])
  const layout = useSelector(selector)

  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false)

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('app_input_fields') })
  }, [t, navigation])

  const onChangeField = useCallback(
    (field: LayoutField) => {
      if (!layout) {
        return
      }
      dispatch(saveLayout(upsertField(layout, field)))
    },
    [dispatch, layout],
  )

  const onDeleteField = useCallback(
    async (field: LayoutField) => {
      if (!layout) {
        return
      }
      try {
        const referenced = isFieldReferenced(layout, field.id)
        const confirmed = await AlertAsync(
          t('app_confirm'),
          referenced
            ? t(
                'app_delete_value_elements_that_use_this_field_will_switch',
                field.label || field.key,
              )
            : t('app_delete_value', field.label || field.key),
          [
            { text: MESSAGE.NO, onPress: () => false, style: 'cancel' },
            { text: MESSAGE.YES, onPress: () => true },
          ],
        )
        if (confirmed) {
          dispatch(saveLayout(removeField(layout, field.id)))
        }
      } catch (e: any) {
        console.warn('onDeleteField', e)
        dispatch(
          enqueueSnackbar({
            message: t('app_could_not_delete_the_input_field'),
          }),
        )
      }
    },
    [t, dispatch, layout],
  )

  const onPressAdd = useCallback(() => setIsDialogVisible(true), [])
  const onCancelDialog = useCallback(() => setIsDialogVisible(false), [])

  const onSubmitLabel = useCallback(
    (label: string) => {
      setIsDialogVisible(false)
      if (!layout) {
        return
      }
      const trimmed = label.trim()
      dispatch(
        saveLayout(
          upsertField(
            layout,
            createLayoutField({
              label: trimmed || t('app_input_fields'),
              key: trimmed || `field${layout.fields.length + 1}`,
            }),
          ),
        ),
      )
    },
    [t, dispatch, layout],
  )

  return (
    <Component
      {...props}
      {...{
        layout,
        isDialogVisible,
        onChangeField,
        onDeleteField,
        onPressAdd,
        onSubmitLabel,
        onCancelDialog,
      }}
    />
  )
}

export { Container as LayoutFields }

const useStyles = makeStyles(useColorScheme, (colorScheme) => {
  const styles = StyleSheet.create({
    scrollView: styleType<ViewStyle>({
      flex: 1,
    }),
    description: styleType<TextStyle>({
      padding: 16,
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
