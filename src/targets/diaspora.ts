import type { ShareMenu, ShareTarget } from '../share-menu.js';

export class DiasporaShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'Diaspora';
  public readonly color = '000';
  public readonly icon =
    'M163 234a71425 71425 0 0 1-37-51 988 988 0 0 0-50 66l-48-34a1727 1727 0 0 1 48-70l-38-14-38-12 8-29 10-28a1317 1317 0 0 1 81 25 2959 2959 0 0 0 1-83h58l1 40 2 47a2601 2601 0 0 0 78-26l17 57a3283 3283 0 0 1-78 27 1059 1059 0 0 0 46 68l-48 35-13-18Z';

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://share.diasporafoundation.org', {
      title: shareMenu.title,
      url: shareMenu.url,
    });
  }
}

customElements.define('share-target-diaspora', DiasporaShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-diaspora': DiasporaShareTarget;
  }
}
