import type { ShareMenu, ShareTarget } from '../share-menu.js';

export class QZoneShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'QZone';
  public readonly color = 'ffce00';
  public readonly icon =
    'M256 99a5 5 0 0 0-5-4l-82-7-36-79a5 5 0 0 0-10 0L87 86 5 95a5 5 0 0 0-5 4 5 5 0 0 0 2 6l60 55-15 84a5 5 0 0 0 2 5 5 5 0 0 0 6 0l74-42 72 43a7 7 0 0 0 6-1 5 5 0 0 0 2-5l-11-62c3-2 12-5 16-10a75 75 0 0 1-17 5c-49 9-124 1-126 1l82-60a941 941 0 0 0-96-7c3-1 87-15 136-1l-83 58s64 6 86 4l-1-12 60-55a6 6 0 0 0 1-6z';

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow(
      'https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey',
      {
        url: shareMenu.url,
        title: shareMenu.title,
        summary: shareMenu.text,
      },
    );
  }
}

customElements.define('share-target-qzone', QZoneShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-qzone': QZoneShareTarget;
  }
}
