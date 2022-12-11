import type { ShareMenu, ShareTarget } from '../share-menu';

export class WeiboShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'Weibo';
  public readonly color = 'df2029';
  public readonly icon =
    'M190 125c-10-2-5-7-5-7s9-16-2-28c-15-14-50 2-50 2-14 4-10-2-8-12 0-12-4-33-40-21s-66 55-66 55c-22 29-19 51-19 51 5 49 57 62 97 65 42 3 99-14 117-51s-14-52-24-54zm-90 91c-42 2-76-19-76-47s34-50 76-52 76 15 76 43-34 54-76 56zm-8-81c-42 5-37 45-37 45s-1 12 11 19c25 13 50 5 63-12s5-57-37-52zm-11 56c-8 1-14-4-14-10s6-14 14-15c9-1 15 5 15 11s-7 13-15 14zm25-21c-2 2-6 1-7-1a6 6 0 0 1 2-8c3-2 6-2 7 1s1 6-2 8zm104-62a7 7 0 0 0 7-6c5-47-38-39-38-39a7 7 0 0 0 0 14c31-7 24 24 24 24a7 7 0 0 0 7 7zm-5-81c-15-3-30 0-34 0l-1 1h-1a10 10 0 0 0 3 20 48 48 0 0 0 9-2c4-2 35-1 50 24 8 19 4 32 3 34a29 29 0 0 0-2 10c0 5 5 9 10 9s9-1 10-9c16-55-20-81-47-87z';

  /**
   * A picture related to the given link
   *
   * @return {string}
   */
  public get pic(): string {
    return this.getAttribute('pic');
  }

  public set pic(val: string) {
    this.setAttribute('pic', val);
  }

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('http://service.weibo.com/share/share.php', {
      url: shareMenu.url,
      appkey: '',
      title: `${shareMenu.title}\n\n${shareMenu.text}`,
      pic:
        this.pic ||
        document.querySelector<HTMLMetaElement>("meta[property='og:image']")
          ?.content ||
        '',
      ralateUid: '',
    });
  }
}

window.customElements.define('share-target-weibo', WeiboShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-weibo': WeiboShareTarget;
  }
}
