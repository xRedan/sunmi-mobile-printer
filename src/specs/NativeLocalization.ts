import type { TurboModule } from 'react-native'
import { TurboModuleRegistry } from 'react-native'
import type { EventEmitter, UnsafeObject } from './CodegenTypes'

export type ResourceSnapshot = {
  locale: string
  strings: UnsafeObject
}

export interface Spec extends TurboModule {
  getResources(): ResourceSnapshot
  getQuantityString(name: string, count: number): string
  readonly onResourcesChanged: EventEmitter<ResourceSnapshot>
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeLocalization')
