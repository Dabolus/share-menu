import type { ShareMenu, ShareTarget } from '../share-menu.js';

export class BloggerShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'Blogger';
  public readonly color = 'f57d00';
  public readonly icon =
    'M174 256a81 81 0 0 0 81-81l1-65-1-4-2-4-4-3c-4-4-28 0-35-6-4-4-5-11-6-21-3-20-4-21-7-28a89 89 0 0 0-63-44H81C36 0 0 36 0 81v94c0 45 36 81 81 81h93zM82 66h45a15 15 0 1 1 0 31H82a15 15 0 1 1 0-31zM67 174a15 15 0 0 1 15-15h92a15 15 0 1 1 0 30H82a16 16 0 0 1-15-15z';

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://www.blogger.com/blog-this.g', {
      u: shareMenu.url,
      n: shareMenu.title,
      t: shareMenu.text,
    });
  }
}

customElements.define('share-target-blogger', BloggerShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-blogger': BloggerShareTarget;
  }
}
