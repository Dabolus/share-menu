import type { ShareMenu, ShareTarget } from '../share-menu';

export class RedditShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'Reddit';
  public readonly color = 'ff4500';
  public readonly icon =
    'M256 121a32 32 0 0 0-57-20c-17-7-36-12-57-14l18-55 39 8a27 27 0 1 0 2-18l-45-10a9 9 0 0 0-11 6l-22 69c-24 1-46 6-66 14a32 32 0 0 0-57 20 32 32 0 0 0 9 23 56 56 0 0 0-5 24c0 22 13 42 37 58 23 15 54 23 87 23s64-8 87-23c24-16 37-36 37-58a56 56 0 0 0-5-24 32 32 0 0 0 9-23zM14 132a21 21 0 0 1-3-11 21 21 0 0 1 21-21 21 21 0 0 1 13 5c-13 8-23 17-31 27zm48 19a23 23 0 1 1 23 23 23 23 0 0 1-23-23zm113 52c-9 10-27 16-47 16s-38-6-47-16a9 9 0 1 1 14-12c5 6 19 10 33 10s28-4 33-10a9 9 0 1 1 14 12zm-4-29a23 23 0 1 1 23-23 23 23 0 0 1-23 23zm71-42c-8-10-18-19-31-27a21 21 0 0 1 13-5 21 21 0 0 1 21 21 21 21 0 0 1-3 11z';

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://reddit.com/submit', {
      title: shareMenu.title,
      ...(shareMenu.text
        ? {
            text: `${shareMenu.text}\n\n${shareMenu.url}`,
          }
        : {
            url: shareMenu.url,
          }),
    });
  }
}

customElements.define('share-target-reddit', RedditShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-reddit': RedditShareTarget;
  }
}
