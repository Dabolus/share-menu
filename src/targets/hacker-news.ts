import type { ShareMenu, ShareTarget } from '../share-menu';

export class HackerNewsShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'Hacker News';
  public readonly color = 'fb651e';
  public readonly icon =
    'M112 157L31 5h37l48 96 2 5a50 50 0 013 6 11 11 0 011 2l1 2 3 7 3 6 6-13 7-15 48-96h35l-82 153v98h-31z';

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://news.ycombinator.com/submitlink', {
      u: shareMenu.url,
      t: shareMenu.title,
    });
  }
}

customElements.define('share-target-hacker-news', HackerNewsShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-hacker-news': HackerNewsShareTarget;
  }
}
