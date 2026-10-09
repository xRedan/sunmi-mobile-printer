import type { NavigationAction } from '@react-navigation/native'
import { t } from '@/localization'

/**
 * 遷移が処理されなかったときに出す文言を作る
 *
 * @note
 * React Native の既定の警告は開発ビルドでしか出ない。リリースビルドでは
 * 何も起きずに終わってしまい、利用者にも開発者にも手がかりが残らない。
 * 画面名まで添えて、どの遷移が捨てられたのかを分かるようにする。
 */
export const describeUnhandledAction = (action: NavigationAction): string => {
  const name = (action.payload as { name?: unknown } | undefined)?.name
  if (typeof name === 'string' && name !== '') {
    return t('app_could_not_open_screen_value', name)
  }
  return t('app_could_not_navigate_value', action.type)
}
