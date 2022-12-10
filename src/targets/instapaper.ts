import type { ShareMenu, ShareTarget } from '../share-menu';

export class InstapaperShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'Instapaper';
  public readonly color = '000';
  public readonly icon =
    'M185 249q-24-2-31-7t-6-28V42q0-21 6-28t31-7V0H71v7q24 1 31 7t6 28v172q0 22-6 28t-31 7v7h114z';

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://www.instapaper.com/edit', {
      url: shareMenu.url,
      title: shareMenu.title,
      description: shareMenu.text,
    });
  }
}

window.customElements.define('share-target-instapaper', InstapaperShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-instapaper': InstapaperShareTarget;
  }
}
