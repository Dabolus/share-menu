import type { ShareMenu, ShareTarget } from '../share-menu';

export class AddThisShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'AddThis';
  public readonly color = 'ff6550';
  public readonly icon = 'M150 51h-44v55H51v44h55v55h44v-55h55v-44h-55V51z';

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://www.addthis.com/bookmark.php', {
      url: shareMenu.url,
    });
  }
}

window.customElements.define('share-target-addthis', AddThisShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-addthis': AddThisShareTarget;
  }
}
