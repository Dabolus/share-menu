import type { ShareMenu, ShareTarget } from '../share-menu.js';

export class LINEShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'LINE';
  public readonly color = '00c300';
  public readonly icon =
    'M256 110C256 53 199 6 128 6S0 53 0 110c0 51 46 94 107 102 4 1 10 3 11 7 2 3 1 8 1 11l-2 11c-1 3-3 13 11 7s74-43 101-74c18-21 27-41 27-64zM78 144H52a7 7 0 0 1-6-7V86a7 7 0 0 1 13 0v45h19a7 7 0 0 1 0 13zm26-7a7 7 0 0 1-13 0V86a7 7 0 1 1 13 0zm61 0a7 7 0 0 1-12 4l-26-35v31a7 7 0 0 1-13 0V86a7 7 0 0 1 4-6 7 7 0 0 1 3 0 7 7 0 0 1 5 2l26 36V86a7 7 0 0 1 13 0v51zm42-32a7 7 0 0 1 0 14h-19v12h19a7 7 0 0 1 0 13h-26a7 7 0 0 1-7-7V86a7 7 0 0 1 7-6h26a7 7 0 0 1 0 13h-19v12h19z';

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://social-plugins.line.me/lineit/share', {
      url: shareMenu.url,
    });
  }
}

customElements.define('share-target-line', LINEShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-line': LINEShareTarget;
  }
}
