import type { ShareMenu, ShareTarget } from '../share-menu.js';

export class BlueskyShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'Bluesky';
  public readonly color = '1185fe';
  public readonly icon =
    'M55 30c30 23 61 67 73 91 12-24 43-68 73-91 21-15 55-28 55 11 0 8-4 66-7 75-9 33-43 41-72 36 52 9 65 38 36 68-54 55-77-14-83-32l-2-4-2 4c-6 18-29 87-83 32-29-30-16-59 36-68-29 5-63-3-72-36-3-9-7-67-7-75C0 2 34 15 55 30Z';

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://bsky.app/intent/compose', {
      text: `${shareMenu.title}\n\n${shareMenu.text}\n\n${shareMenu.url}`,
    });
  }
}

customElements.define('share-target-bluesky', BlueskyShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-bluesky': BlueskyShareTarget;
  }
}
