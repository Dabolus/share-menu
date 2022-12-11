import type { ShareMenu, ShareTarget } from '../share-menu';

export class PrintShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'Print';
  public readonly color = '425563';
  public readonly icon =
    'M217 77H39a38 38 0 0 0-38 38v77h51v50h152v-50h51v-77a38 38 0 0 0-38-38zm-38 140H77v-64h102zm38-89a13 13 0 1 1 13-13 13 13 0 0 1-13 13zM204 14H52v51h152z';

  public share(shareMenu: ShareMenu) {
    if (!shareMenu.url || shareMenu.url === window.location.href) {
      shareMenu.addEventListener('close', () => window.print(), {
        once: true,
      });
    } else {
      shareMenu.openWindow(shareMenu.url)?.print();
    }
  }
}

window.customElements.define('share-target-print', PrintShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-print': PrintShareTarget;
  }
}
