import { updateStringAttribute } from '../helpers.js';
import type { ShareMenu, ShareTarget } from '../share-menu.js';

export class XINGShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'XING';
  public readonly color = '026466';
  public readonly icon =
    'M157 256l-57-100L189 0h60l-89 156 57 100zm-94-77l45-74-33-58H18l34 58-45 74z';

  /**
   * A URL to redirect to after the share has been completed.
   *
   * @return {string | null}
   */
  public get followUrl(): string | null {
    return this.getAttribute('follow-url');
  }

  public set followUrl(val: string | null | undefined) {
    updateStringAttribute(this, 'follow-url', val);
  }

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://www.xing.com/spi/shares/new', {
      url: shareMenu.url,
      follow_url: this.followUrl || undefined,
    });
  }
}

customElements.define('share-target-xing', XINGShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-xing': XINGShareTarget;
  }
}
