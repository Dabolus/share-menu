import type { ShareMenu, ShareTarget } from '../share-menu';

export class MastodonShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'Mastodon';
  public readonly color = '6364ff';
  public readonly icon =
    'M242 153c-3 19-31 38-63 42-17 2-33 4-51 3-29-1-51-7-51-7v8c4 29 28 30 51 31 24 1 44-6 44-6l1 21s-16 9-45 11c-16 1-36-1-59-7-50-13-59-67-60-121V84c0-55 36-72 36-72C63 4 95 0 128 0s65 4 83 12c0 0 36 17 36 72 0 0 1 41-5 69Zm-38-65c0-13-3-24-10-32s-17-13-29-13c-13 0-24 6-30 16l-7 11-7-11c-6-10-17-16-30-16-12 0-22 5-29 13S52 75 52 88v68h26V90c0-13 6-20 18-20s19 8 19 24v36h26V94c0-16 7-24 19-24s18 7 18 20v66h26V88Z';

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://toot.kytta.dev', {
      text: `${shareMenu.title}\n\n${shareMenu.text}\n\n${shareMenu.url}`,
    });
  }
}

window.customElements.define('share-target-mastodon', MastodonShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-mastodon': MastodonShareTarget;
  }
}
