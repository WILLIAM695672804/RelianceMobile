package cm.reliance.cookies

import android.webkit.CookieManager
import expo.modules.kotlin.Promise
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Cookies de la pile réseau de React Native : ForwardingCookieHandler délègue
 * la persistance des cookies d'OkHttp à android.webkit.CookieManager.
 */
class RelianceCookiesModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("RelianceCookies")

    AsyncFunction("getCookieValue") { url: String, name: String ->
      val header = CookieManager.getInstance().getCookie(url) ?: return@AsyncFunction null
      header.split(";")
        .map { it.trim() }
        .firstOrNull { it.substringBefore("=") == name }
        ?.substringAfter("=", "")
    }

    // removeAllCookies exige un thread doté d'une Looper : exécution sur le thread principal.
    AsyncFunction("clearAll") { promise: Promise ->
      val manager = CookieManager.getInstance()
      manager.removeAllCookies {
        manager.flush()
        promise.resolve(null)
      }
    }.runOnQueue(Queues.MAIN)
  }
}
