package com.mobpri.localization

import android.content.res.Configuration
import android.os.LocaleList
import androidx.test.platform.app.InstrumentationRegistry
import com.mobpri.R
import java.util.Locale
import org.junit.Assert.assertEquals
import org.junit.Test

class LocalizationResourcesTest {
  private fun resources(vararg locales: String) =
    InstrumentationRegistry.getInstrumentation().targetContext.createConfigurationContext(
      Configuration(InstrumentationRegistry.getInstrumentation().targetContext.resources.configuration).apply {
        setLocales(LocaleList(*locales.map(Locale::forLanguageTag).toTypedArray()))
      },
    ).resources

  @Test fun testJapaneseSelection() {
    assertEquals("モバイル印刷", resources("ja-JP").getString(R.string.app_name))
    assertEquals("モバイル印刷", resources("ja-JP", "en-US").getString(R.string.app_name))
  }

  @Test fun testEnglishRegionalVariants() {
    for (locale in listOf("en-US", "en-GB")) {
      val values = resources(locale)
      assertEquals("Mobile Print", values.getString(R.string.app_name))
      assertEquals("Cancel", LocalizationResources.strings(values).getString("app_cancel"))
    }
  }

  @Test fun testUnsupportedLanguageFallsBackToEnglish() {
    for (locale in listOf("it-IT", "fr-FR", "de-DE")) {
      assertEquals("Mobile Print", resources(locale).getString(R.string.app_name))
    }
    assertEquals("Mobile Print", resources("it-IT", "fr-FR").getString(R.string.app_name))
  }

  @Test fun testSecondarySupportedLanguage() {
    assertEquals("Mobile Print", resources("it-IT", "en-GB").getString(R.string.app_name))
  }

  @Test fun testSecondaryJapaneseLanguage() {
    assertEquals("モバイル印刷", resources("it-IT", "ja-JP").getString(R.string.app_name))
  }

  @Test fun testEnglishBeforeJapanese() {
    assertEquals("Mobile Print", resources("en-US", "ja-JP").getString(R.string.app_name))
  }

  @Test fun testQuantitySelection() {
    val english = resources("en-US")
    assertEquals("%1\$s package", LocalizationResources.quantity(english, "app_value_packages", 1))
    assertEquals("%1\$s packages", LocalizationResources.quantity(english, "app_value_packages", 0))
    assertEquals("%1\$s packages", LocalizationResources.quantity(english, "app_value_packages", 2))
    assertEquals("%1\$s個のパッケージ", LocalizationResources.quantity(resources("ja-JP"), "app_value_packages", 1))
  }
}
