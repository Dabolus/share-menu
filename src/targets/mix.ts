import type { ShareMenu, ShareTarget } from '../share-menu.js';

export class MixShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'Mix';
  public readonly color = 'ff8226';
  public readonly icon =
    'M252.4 13a100 100 0 0 0-99 99v66a25.6 25.6 0 0 1-51.1 0V79.8a25.6 25.6 0 0 0-51.1-2V218a25.4 25.4 0 0 1-25.6 25.2A25.4 25.4 0 0 1 0 218V13h252.4Zm0 0h3.6v142.6a25.6 25.6 0 0 1-51.2 0v-12.8a25.6 25.6 0 1 0-51.2 0V112a100 100 0 0 1 98.8-99Z';

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://mix.com/add', {
      url: shareMenu.url,
    });
  }
}

customElements.define('share-target-mix', MixShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-mix': MixShareTarget;
  }
}
