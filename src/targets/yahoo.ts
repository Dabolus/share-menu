import type { ShareMenu, ShareTarget } from '../share-menu';

export class YahooShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'Yahoo!';
  public readonly color = '410093';
  public readonly icon =
    'M206 89c-6 2-63 46-67 57-1 4 0 40 1 46l36 1-1 11h-59l-52 1 2-11c5 0 28 1 32-4 3-3 2-38 1-43-2-7-52-70-65-80H0V51h114v16H80l46 63 46-42h-27l-4-16h100l-1 1h1l-7 11h-1l-2 4h-19l-6 1zm33 99h-9l-10-1v17h8l8 1zm17-80l-34-4 1 72 15 1z';

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://compose.mail.yahoo.com', {
      subject: shareMenu.title,
      body: `${shareMenu.text}\n\n${shareMenu.url}`,
    });
  }
}

window.customElements.define('share-target-yahoo', YahooShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-yahoo': YahooShareTarget;
  }
}
