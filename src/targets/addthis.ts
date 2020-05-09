import type { ShareMenu, ShareTarget } from '../share-menu';

export class AddThisShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'AddThis';
  public readonly color = 'ff6550';
  public readonly icon = 'M165 0H91v91H0v74h91v91h74v-91h91V91h-91z';

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
