import { updateStringAttribute } from '../helpers.js';
import type { ShareMenu, ShareTarget } from '../share-menu.js';

export class MessengerShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'Messenger';
  public readonly color = 'a334fa';
  public readonly icon =
    'M128 0c72 0 128 53 128 124 0 72-56 124-128 124-13 0-25-1-37-5l-7 1-25 11a10 10 0 0 1-15-9v-23c0-3-2-5-4-7-25-22-40-55-40-92C0 53 56 0 128 0ZM51 160c-3 6 4 13 9 9l40-31c3-2 7-2 10 0l29 22a19 19 0 0 0 28-5l38-59c3-6-4-13-9-9l-40 31c-3 2-7 2-10 0l-29-22a19 19 0 0 0-28 5l-38 59Z';

  /**
   * The Facebook App ID.
   *
   * @return {string | null}
   */
  public get appId(): string | null {
    return this.getAttribute('app-id');
  }

  public set appId(val: string | null | undefined) {
    updateStringAttribute(this, 'app-id', val);
  }

  /**
   * A URL to redirect to after the share has been completed.
   *
   * @return {string | null}
   */
  public get redirectUri(): string | null {
    return this.getAttribute('redirect-uri');
  }

  public set redirectUri(val: string | null | undefined) {
    updateStringAttribute(this, 'redirect-uri', val);
  }

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://www.facebook.com/dialog/send', {
      app_id: this.appId,
      display: 'popup',
      link: shareMenu.url,
      redirect_uri: this.redirectUri || undefined,
    });
  }
}

customElements.define('share-target-messenger', MessengerShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-messenger': MessengerShareTarget;
  }
}
