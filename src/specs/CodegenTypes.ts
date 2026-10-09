import type { NativeEventSubscription } from 'react-native'

export type UnsafeObject = Record<string, string>
export type EventEmitter<T> = (
  handler: (event: T) => void,
) => NativeEventSubscription
