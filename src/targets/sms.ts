import type { ShareMenu, ShareTarget } from '../share-menu.js';

export class SMSShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'SMS';
  public readonly color = '43695b';
  public readonly icon =
    'M230 0H26A26 26 0 0 0 0 26v230l51-51h179a26 26 0 0 0 26-26V26a26 26 0 0 0-26-26zM51 90h154v25H51zm103 64H51v-26h103zm51-77H51V51h154z';

  public share(shareMenu: ShareMenu) {
    let separator = '?';
    // iOS uses two different separators, so we have to check the iOS version and use the proper one
    if (/iP(hone|od|ad)/.test(navigator.platform)) {
      const [, version] = navigator.appVersion.match(/OS (\d+)/);
      separator = parseInt(version, 10) < 8 ? ';' : '&';
    }

    shareMenu.openWindow(
      `sms:${separator}body=${encodeURIComponent(
        shareMenu.title,
      )}%0A%0A${encodeURIComponent(shareMenu.text)}%0A%0A${encodeURIComponent(
        shareMenu.url,
      )}`,
      undefined,
      true,
    );
  }
}

customElements.define('share-target-sms', SMSShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-sms': SMSShareTarget;
  }
}
