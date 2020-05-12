import type { ShareMenu, ShareTarget } from '../share-menu';

export class SMSShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'SMS';
  public readonly color = '43695b';
  public readonly icon =
    'M230 26H26A26 26 0 0 0 0 51v154a26 26 0 0 0 26 25h204a26 26 0 0 0 26-25V51a26 26 0 0 0-26-25zm0 51l-102 64L26 77V51l102 64 102-64z';

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

window.customElements.define('share-target-sms', SMSShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-sms': SMSShareTarget;
  }
}
