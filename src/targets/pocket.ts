import type { ShareMenu, ShareTarget } from '../share-menu.js';

export class PocketShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'Pocket';
  public readonly color = 'ef4056';
  public readonly icon =
    'M256 46a38 38 0 0 0-38-38H38C17 8 0 26 0 46v103c0 54 58 99 128 99s128-45 128-99V46zm-49 66l-63 63a22 22 0 0 1-16 7h-1a22 22 0 0 1-16-7l-63-63c-9-9-9-22 0-31 8-8 22-8 31 0l48 49 48-49c8-8 22-8 31 0 10 9 10 23 1 31z';

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://getpocket.com/save', {
      url: shareMenu.url,
    });
  }
}

customElements.define('share-target-pocket', PocketShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-pocket': PocketShareTarget;
  }
}
