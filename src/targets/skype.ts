import type { ShareMenu, ShareTarget } from '../share-menu';

export class SkypeShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'Skype';
  public readonly color = '00aff0';
  public readonly icon =
    'M245 147A119 119 0 0 0 128 9a120 120 0 0 0-19 2 72 72 0 0 0-98 98 121 121 0 0 0-2 19 119 119 0 0 0 138 117 72 72 0 0 0 98-98zm-61 35c-5 7-12 13-22 17s-21 6-34 6q-24 0-39-8a51 51 0 0 1-18-16c-5-7-7-14-7-20a13 13 0 0 1 4-10 15 15 0 0 1 11-4 13 13 0 0 1 9 3 24 24 0 0 1 6 10 58 58 0 0 0 7 11 26 26 0 0 0 10 8q6 3 16 3c10 0 17-2 23-6s9-9 9-15a15 15 0 0 0-5-12 31 31 0 0 0-12-7l-20-5a160 160 0 0 1-29-9 47 47 0 0 1-19-13c-5-6-7-14-7-22a36 36 0 0 1 7-22q8-10 21-15t33-5q14 0 25 3a56 56 0 0 1 18 9 39 39 0 0 1 11 12 26 26 0 0 1 3 13 14 14 0 0 1-4 10 14 14 0 0 1-11 4c-4 0-7-1-9-3a35 35 0 0 1-6-8 38 38 0 0 0-10-13c-4-3-11-5-20-5-8 0-14 2-19 5s-8 8-8 12a11 11 0 0 0 3 7 21 21 0 0 0 7 6 49 49 0 0 0 9 3l15 4 25 7a77 77 0 0 1 18 8 36 36 0 0 1 13 13q4 8 4 20a42 42 0 0 1-8 24z';

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://web.skype.com/share', {
      url: shareMenu.url,
      text: `${shareMenu.title}\n\n${shareMenu.text}`,
    });
  }
}

customElements.define('share-target-skype', SkypeShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-skype': SkypeShareTarget;
  }
}
