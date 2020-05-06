import type { ShareMenu, ShareTarget } from '../share-menu';

export class FacebookShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'Facebook';
  public readonly color = '#3b5998';
  public readonly icon =
    'M94 50v35H68v43h26v128h53V128h36l5-43h-41V55c0-4 6-10 12-10h29V0h-40C93 0 94 43 94 50z';

  public share(shareMenu: ShareMenu) {
    if (window.FB) {
      window.FB.ui({
        href: shareMenu.url,
        method: 'share',
        mobile_iframe: true, // eslint-disable-line @typescript-eslint/camelcase
        quote: shareMenu.text,
      });
    } else {
      shareMenu.openWindow(
        `https://www.facebook.com/sharer.php?u=${encodeURIComponent(
          shareMenu.url,
        )}`,
      );
    }
  }
}

window.customElements.define('share-target-facebook', FacebookShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-facebook': FacebookShareTarget;
  }
}
