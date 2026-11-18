import ExpoModulesCore

/// Cookies de la pile réseau de React Native (NSURLSession → HTTPCookieStorage.shared).
public class RelianceCookiesModule: Module {
  public func definition() -> ModuleDefinition {
    Name("RelianceCookies")

    AsyncFunction("getCookieValue") { (url: URL, name: String) -> String? in
      HTTPCookieStorage.shared.cookies(for: url)?.first { $0.name == name }?.value
    }

    // HTTPCookieStorage persiste de lui-même : rien à forcer.
    AsyncFunction("flush") {}

    AsyncFunction("clearAll") {
      let storage = HTTPCookieStorage.shared
      storage.cookies?.forEach { storage.deleteCookie($0) }
    }
  }
}
