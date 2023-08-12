import type { ShareMenu, ShareTarget } from '../share-menu';

export class FacebookShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'Facebook';
  public readonly color = '3b5998';
  public readonly icon =
    'M94 50v35H68v43h26v128h53V128h36l5-43h-41V55c0-4 6-10 12-10h29V0h-40C93 0 94 43 94 50z';

  /**
   * The Facebook App ID. If the Facebook JS SDK is not found and this parameter
   * is specified, then the Facebook share dialog will be used instead of the sharer
   * API to make it possible to also share the text and title together with the URL.
   *
   * @return {string}
   */
  public get appId(): string {
    return this.getAttribute('app-id');
  }

  public set appId(val: string) {
    this.setAttribute('app-id', val);
  }

  /**
   * A URL to redirect to after the share has been completed
   *
   * @return {string}
   */
  public get redirectUri(): string {
    return this.getAttribute('redirect-uri');
  }

  public set redirectUri(val: string) {
    this.setAttribute('redirect-uri', val);
  }

  public share(shareMenu: ShareMenu) {
    if (window.FB) {
      window.FB.ui({
        method: 'share',
        href: shareMenu.url,
        quote: `${shareMenu.title}\n${shareMenu.text}`,
      });
    } else if (this.appId) {
      shareMenu.openWindow('https://www.facebook.com/dialog/share', {
        app_id: this.appId,
        display: 'popup',
        href: shareMenu.url,
        quote: `${shareMenu.title}\n${shareMenu.text}`,
        redirect_uri: this.redirectUri || undefined,
      });
    } else {
      shareMenu.openWindow('https://www.facebook.com/sharer.php', {
        u: shareMenu.url,
      });
    }
  }
}

customElements.define('share-target-facebook', FacebookShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-facebook': FacebookShareTarget;
  }
}
