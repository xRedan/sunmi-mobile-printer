import { t } from '@/localization'
/**
 * アプリ内の「使い方」に並べる説明
 *
 * @note
 * 画面の作りを変えたら、[`docs/usage.md`](../../../docs/usage.md) も
 * あわせて直すこと。片方だけ古くなると、利用者が迷う。
 */
export type GuideSection = {
  title: string
  body: string
}

export const guideSections: GuideSection[] = [
  {
    get title() {
      return t('app_two_ways_to_print')
    },
    get body() {
      return [
        t('app_quick_print_sends_text_you_enter_or_an_image'),
        '',
        t('app_layout_printing_fills_a_saved_layout_with_your_content'),
      ].join('\n')
    },
  },
  {
    get title() {
      return t('app_three_terms_used_in_layout_printing')
    },
    get body() {
      return [
        t('app_a_layout_defines_the_appearance_of_a_printout_arrange'),
        '',
        t('app_an_input_field_is_a_part_of_a_layout'),
        '',
        t('app_a_print_record_contains_the_values_entered_into_the'),
        '',
        t('app_layouts_and_print_records_look_similar_in_lists_the'),
      ].join('\n')
    },
  },
  {
    get title() {
      return t('app_print')
    },
    get body() {
      return [
        t('app_print_records_appear_under_layout_printing_on_the_home'),
        '',
        t('app_tap_the_pencil_on_the_right_to_edit_the'),
      ].join('\n')
    },
  },
  {
    get title() {
      return t('app_create_a_layout')
    },
    get body() {
      return [
        t('app_open_manage_layouts_from_the_home_screen'),
        '',
        t('app_tap_add_a_layout_to_create_one_press_and'),
      ].join('\n')
    },
  },
  {
    get title() {
      return t('app_arrange_elements')
    },
    get body() {
      return [
        t('app_open_a_layout_to_see_its_elements_in_print'),
        '',
        t('app_tap_add_an_element_to_add_one_tap_an'),
      ].join('\n')
    },
  },
  {
    get title() {
      return t('app_content_source')
    },
    get body() {
      return [
        t('app_for_each_element_choose_fixed_content_or_an_input'),
        '',
        t('app_when_using_an_input_field_select_which_field_supplies'),
        '',
        t('app_switching_back_to_fixed_content_leaves_the_input_field'),
      ].join('\n')
    },
  },
  {
    get title() {
      return t('app_enter_print_data')
    },
    get body() {
      return [
        t('app_open_print_data_from_the_layout_screen_and_enter'),
        '',
        t('app_if_skip_this_element_when_empty_is_enabled_an'),
        '',
        t('app_only_fields_referenced_by_an_element_can_be_edited'),
      ].join('\n')
    },
  },
  {
    get title() {
      return t('app_check_the_print_preview')
    },
    get body() {
      return [
        t('app_tap_print_preview_on_the_layout_screen_to_check'),
        '',
        t('app_this_is_an_on_screen_preview_fonts_and_line'),
      ].join('\n')
    },
  },
]
