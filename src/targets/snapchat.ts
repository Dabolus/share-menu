import type { ShareMenu, ShareTarget } from '../share-menu';

export class SnapchatShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'Snapchat';
  public readonly color = 'fffc00';
  public readonly outline = '000';
  public readonly icon =
    'M130 248a41 41 0 0 1-4 0c-15 0-25-7-34-13-6-5-13-9-20-11H62l-15 1-5 1c-2 0-3 0-4-3l-1-6c-1-5-2-8-4-8-24-4-31-9-33-12v-2l2-3c37-6 54-43 55-45 2-5 2-9 1-12-3-6-11-9-16-10l-4-2c-11-4-12-8-11-11 0-3 5-6 10-6h3c5 3 9 4 13 4 5 0 7-2 8-3l-1-7c-1-18-2-40 3-52 17-37 52-40 62-40h6c10 0 45 3 62 40 5 12 4 34 3 52l-1 7c1 1 3 3 8 3 3 0 7-1 12-4h8v1c4 1 6 3 7 6 0 3-2 7-12 10l-4 2c-5 1-13 4-16 10-1 3-1 7 1 12 1 2 18 39 55 45l2 3v2c-2 3-9 8-33 12-2 0-3 3-4 8l-1 6c-1 2-2 3-4 3l-5-1a72 72 0 0 0-25-1c-7 2-14 6-20 11-9 6-19 13-34 13';

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://www.snapchat.com/scan', {
      attachmentUrl: shareMenu.url,
    });
  }
}

customElements.define('share-target-snapchat', SnapchatShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-snapchat': SnapchatShareTarget;
  }
}
