import type { ShareMenu, ShareTarget } from '../share-menu';

export class GoogleBookmarksShareTarget
  extends HTMLElement
  implements ShareTarget
{
  public readonly displayName = 'Google Bookmarks';
  public readonly color = '4285f4';
  public readonly icon =
    'M254 131c0 73-50 125-124 125a128 128 0 010-256c35 0 64 13 86 34l-35 33C135 23 51 56 51 128c0 45 35 81 79 81 51 0 70-37 73-55h-73v-44h122a112 112 0 012 21z';

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://www.google.com/bookmarks/mark', {
      op: 'edit',
      bkmk: shareMenu.url,
      title: shareMenu.title,
      annotation: shareMenu.text,
    });
  }
}

window.customElements.define(
  'share-target-google-bookmarks',
  GoogleBookmarksShareTarget,
);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-google-bookmarks': GoogleBookmarksShareTarget;
  }
}
