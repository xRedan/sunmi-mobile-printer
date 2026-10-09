import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
} from 'react'
import { AppState } from 'react-native'
import NativeLocalization, {
  type ResourceSnapshot,
} from '@/specs/NativeLocalization'
import { type QuantityKey, type StringKey, stringKeys } from './resourceKeys'

const validateSnapshot = (resources: ResourceSnapshot) => {
  for (const key of stringKeys) {
    if (typeof resources.strings[key] !== 'string') {
      throw new Error(`Missing Android string resource: ${key}`)
    }
  }
  return resources
}

let snapshot = validateSnapshot(NativeLocalization.getResources())
const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const getSnapshot = () => snapshot

export const refreshResources = (
  resources = NativeLocalization.getResources(),
) => {
  const next = validateSnapshot(resources)
  if (next.locale === snapshot.locale) return
  snapshot = next
  for (const listener of listeners) listener()
}

const format = (text: string, values: (string | number)[]) =>
  text.replace(/%(\d+)\$s/g, (_, position: string) => {
    const value = values[Number(position) - 1]
    if (value === undefined) {
      throw new Error(`Missing localized string argument: ${position}`)
    }
    return String(value)
  })

export const t = (key: StringKey, ...values: (string | number)[]): string =>
  format(snapshot.strings[key], values)

export const quantity = (
  key: QuantityKey,
  count: number,
  ...values: (string | number)[]
): string => format(NativeLocalization.getQuantityString(key, count), values)

const LocalizationContext = createContext(snapshot)

export const LocalizationProvider = ({ children }: PropsWithChildren) => {
  const resources = useSyncExternalStore(subscribe, getSnapshot)
  useEffect(() => {
    const changes = NativeLocalization.onResourcesChanged(refreshResources)
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshResources()
    })
    refreshResources()
    return () => {
      changes.remove()
      appState.remove()
    }
  }, [])

  return (
    <LocalizationContext.Provider value={resources}>
      {children}
    </LocalizationContext.Provider>
  )
}

export const useLocalization = () => {
  const resources = useContext(LocalizationContext)
  return useCallback(
    (key: StringKey, ...values: (string | number)[]) =>
      format(resources.strings[key], values),
    [resources],
  )
}
