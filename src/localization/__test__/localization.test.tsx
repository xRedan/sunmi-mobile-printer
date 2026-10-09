import { afterEach, describe, expect, it } from '@jest/globals'
import { act, create, type ReactTestRenderer } from 'react-test-renderer'
import { MESSAGE } from '@/CONSTANTS'
import { createPresets } from '@/print/presets'
import { guideSections } from '@/screens/Guide/sections'
import NativeLocalization from '@/specs/NativeLocalization'
import {
  LocalizationProvider,
  quantity,
  refreshResources,
  t,
  useLocalization,
} from '..'
import { quantityKeys, stringKeys } from '../resourceKeys'

const { setLocale, resources } = require('../../../jest/mocks/localization')
const changeLocale = (locale: string) => {
  setLocale(locale)
  refreshResources()
}

afterEach(() => changeLocale('ja-JP'))

describe('Android resource localization', () => {
  it('provides matching Japanese and English resources and argument positions', () => {
    expect(resources.default).toEqual(resources.en)
    expect(Object.keys(resources.ja.strings).sort()).toEqual(
      [...stringKeys].sort(),
    )
    expect(Object.keys(resources.en.strings).sort()).toEqual(
      [...stringKeys].sort(),
    )
    expect(Object.keys(resources.ja.plurals).sort()).toEqual(
      [...quantityKeys].sort(),
    )
    expect(Object.keys(resources.en.plurals).sort()).toEqual(
      [...quantityKeys].sort(),
    )
    for (const key of stringKeys) {
      const placeholders = (text: string) =>
        [...text.matchAll(/%(\d+)\$s/g)].map((m) => m[1]).sort()
      expect(placeholders(resources.en.strings[key])).toEqual(
        placeholders(resources.ja.strings[key]),
      )
    }
  })

  it('preserves Japanese labels and changes module-level labels and the guide when resources change', () => {
    expect(t('app_name')).toBe('モバイル印刷')
    expect(MESSAGE.CANCEL).toBe('キャンセル')
    const japaneseGuide = guideSections.map((section) => ({ ...section }))

    changeLocale('en-US')

    expect(t('app_name')).toBe('Mobile Print')
    expect(MESSAGE.CANCEL).toBe('Cancel')
    expect(guideSections[0].title).toBe('Two ways to print')
    expect(guideSections[0].body).not.toBe(japaneseGuide[0].body)
  })

  it('uses English when no preferred language is supported', () => {
    for (const locale of ['it-IT', 'fr-FR', 'de-DE', 'it-IT,fr-FR']) {
      changeLocale(locale)
      expect(t('app_name')).toBe('Mobile Print')
      expect(MESSAGE.CANCEL).toBe('Cancel')
      expect(quantity('app_value_packages', 2, 2)).toBe('2 packages')
    }
  })

  it('uses the first supported preferred language before the fallback', () => {
    changeLocale('it-IT,ja-JP,en-US')
    expect(t('app_name')).toBe('モバイル印刷')
    changeLocale('it-IT,en-US,ja-JP')
    expect(t('app_name')).toBe('Mobile Print')
  })

  it('formats user-supplied text without treating its percent signs as placeholders', () => {
    changeLocale('en-GB')
    expect(t('app_delete_value', '50% / %1$s')).toBe('Delete 50% / %1$s?')
    changeLocale('ja-JP')
    expect(t('app_delete_value', '50%')).toBe('「50%」を削除しますか？')
    expect(() => t('app_delete_value')).toThrow(
      'Missing localized string argument',
    )
  })

  it('uses Android quantity resources for singular, plural and zero counts', () => {
    changeLocale('en-US')
    expect(quantity('app_value_packages', 1, 1)).toBe('1 package')
    expect(quantity('app_value_packages', 2, 2)).toBe('2 packages')
    expect(quantity('app_value_packages', 0, 0)).toBe('0 packages')
    changeLocale('ja-JP')
    expect(quantity('app_value_packages', 1, 1)).toBe('1個のパッケージ')
  })

  it('creates new presets in the current language without changing records created earlier', () => {
    const japanese = createPresets()
    const before = JSON.stringify(japanese)
    expect(japanese.layouts.map((layout) => layout.name)).toEqual([
      '名刺',
      '名刺（シンプル）',
    ])
    changeLocale('en-US')
    const english = createPresets()
    expect(english.layouts.map((layout) => layout.name)).toEqual([
      'Business card',
      'Business card (simple)',
    ])
    expect(english.layouts[0].fields[0].label).toBe('Name')
    expect(JSON.stringify(japanese)).toBe(before)
  })

  it('refreshes visible text without remounting the component', async () => {
    let mounts = 0
    const { useState } = require('react')
    const Probe = () => {
      const text = useLocalization()
      useState(() => ++mounts)
      return <>{text('app_name')}</>
    }
    let renderer: ReactTestRenderer | undefined
    await act(async () => {
      renderer = create(
        <LocalizationProvider>
          <Probe />
        </LocalizationProvider>,
      )
    })
    expect(renderer?.toJSON()).toBe('モバイル印刷')
    await act(async () => setLocale('en-US'))
    expect(renderer?.toJSON()).toBe('Mobile Print')
    expect(mounts).toBe(1)
    await act(async () => renderer?.unmount())
  })

  it('fails visibly if the native resource catalog is incomplete', () => {
    expect(() => refreshResources({ locale: 'en-US', strings: {} })).toThrow(
      'Missing Android string resource',
    )
    expect(t('app_name')).toBe('モバイル印刷')
    expect(NativeLocalization.getResources().locale).toBe('ja-JP')
  })
})
