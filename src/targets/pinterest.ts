import type { ShareMenu, ShareTarget } from '../share-menu.js';

export class PinterestShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'Pinterest';
  public readonly color = 'bd081c';
  public readonly icon =
    'M30 92a85 85 0 0 1 5-31 80 80 0 0 1 16-26 109 109 0 0 1 52-31 122 122 0 0 1 31-4 102 102 0 0 1 45 10 85 85 0 0 1 34 30q14 20 14 44a142 142 0 0 1-3 29 117 117 0 0 1-10 27 95 95 0 0 1-15 23 67 67 0 0 1-22 16 70 70 0 0 1-29 6 48 48 0 0 1-21-5c-7-3-12-8-15-13l-4 17-4 15-3 11a73 73 0 0 1-4 10l-5 10a107 107 0 0 1-7 12l-10 13-2 1-1-2-2-28a172 172 0 0 1 3-32q3-18 10-44t8-32c-3-6-5-15-5-26a41 41 0 0 1 8-24q8-11 21-11 9 0 14 6c4 4 5 10 5 16q0 10-6 29t-7 29a21 21 0 0 0 7 16 24 24 0 0 0 17 7 33 33 0 0 0 15-4 35 35 0 0 0 12-11 88 88 0 0 0 9-14 84 84 0 0 0 6-17 172 172 0 0 0 3-17 122 122 0 0 0 1-16q0-26-17-41t-44-15q-31 0-51 20T58 96a49 49 0 0 0 6 23l4 7 2 4a37 37 0 0 1-2 12c-2 4-3 6-6 6h-2a32 32 0 0 1-14-9 45 45 0 0 1-10-14 95 95 0 0 1-5-17 71 71 0 0 1-1-16z';

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://pinterest.com/pin/create/button', {
      url: shareMenu.url,
      description: `${shareMenu.title}\n\n${shareMenu.text}`,
      media:
        shareMenu.image ||
        document.querySelector<HTMLMetaElement>("meta[property='og:image']")
          ?.content,
    });
  }
}

customElements.define('share-target-pinterest', PinterestShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-pinterest': PinterestShareTarget;
  }
}
