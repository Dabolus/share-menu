import type { ShareMenu, ShareTarget } from '../share-menu';

export class LinkedInShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'LinkedIn';
  public readonly color = '0077b5';
  public readonly icon =
    'M256 156v94h-55v-88c0-22-8-37-28-37-15 0-24 10-28 20l-2 13v92H88V85h55v24c8-12 21-28 50-28 36 0 63 24 63 75zM31 6C12 6 0 18 0 34s12 29 30 29h1c19 0 31-13 31-29C61 18 50 6 31 6zM3 250h55V85H3z';

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://www.linkedin.com/sharing/share-offsite', {
      url: shareMenu.url,
    });
  }
}

customElements.define('share-target-linkedin', LinkedInShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-linkedin': LinkedInShareTarget;
  }
}
