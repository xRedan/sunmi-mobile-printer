package com.mobpri.localization

import android.content.ComponentCallbacks
import android.content.res.Configuration
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap

class LocalizationModule(private val context: ReactApplicationContext) :
  NativeLocalizationSpec(context), ComponentCallbacks {

  override fun getName() = NAME

  override fun getResources(): WritableMap {
    val resources = context.resources
    return Arguments.createMap().apply {
      putString("locale", resources.configuration.locales.toLanguageTags())
      putMap("strings", LocalizationResources.strings(resources))
    }
  }

  override fun getQuantityString(name: String, count: Double): String =
    LocalizationResources.quantity(context.resources, name, count.toInt())

  override fun initialize() {
    super.initialize()
    context.registerComponentCallbacks(this)
  }

  override fun invalidate() {
    context.unregisterComponentCallbacks(this)
    super.invalidate()
  }

  override fun onConfigurationChanged(configuration: Configuration) {
    emitOnResourcesChanged(getResources())
  }

  override fun onLowMemory() = Unit

  companion object {
    const val NAME = "NativeLocalization"
  }
}
