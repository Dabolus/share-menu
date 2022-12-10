import type { ShareMenu, ShareTarget } from '../share-menu';

export class FlipboardShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'Flipboard';
  public readonly color = 'e12828';
  public readonly icon = 'M0 0h83v256H0zm91 91h82v82H91zm0-91h165v83H91z';

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://share.flipboard.com/bookmarklet/popout', {
      v: 2,
      title: shareMenu.title,
      url: shareMenu.url,
    });
  }
}

window.customElements.define('share-target-flipboard', FlipboardShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-flipboard': FlipboardShareTarget;
  }
}
