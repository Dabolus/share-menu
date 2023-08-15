import type { ShareMenu, ShareTarget } from '../share-menu.js';

export class DoubanShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'Douban';
  public readonly color = '007610';
  public readonly icon =
    'M1 69h120v13H1zm98 76h11V95H10v50h11l9 29H0v11h120v-11H90zm-69-37h61v24H30zm43 66H47l-9-29h44zm92-35-9 2v-14h12v-13h-5l2-27h2V77h-12V67h-10v10h-13v10h2l2 27h-6v13h13v15l-11 2v13l11-2c-1 12-8 29-8 29l11 5c1-1 10-22 10-37l9-1v-12zm-12-25h-7l-1-27h10z"/><path d="M213 144V78l3-1-8-10-39 9v75c0 10-7 27-10 33l10 5c0-1 11-24 11-38V84l5-1v90h-8v13l26-2v-11h-7V81l7-2v64c-1 3-1 28 9 45l12-3-2-2c-10-13-9-39-9-39z"/><path d="M256 127v-13h-6l2-26h3V77h-13V67h-11v10h-14v11h3l3 26h-7v13h14v15h-12v12h12v34h13v-34h11v-12h-11v-15zm-17-13h-6l-2-26h10z';

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://www.douban.com/recommend/', {
      name: shareMenu.title,
      text: shareMenu.text,
      comment: shareMenu.url,
      href: shareMenu.url,
    });
  }
}

customElements.define('share-target-douban', DoubanShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-douban': DoubanShareTarget;
  }
}
