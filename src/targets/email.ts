import type { ShareMenu, ShareTarget } from '../share-menu';

export class EmailShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'Email';
  public readonly color = 'ffa930';
  public readonly icon =
    'M230 26H26A26 26 0 0 0 0 51v154a26 26 0 0 0 26 25h204a26 26 0 0 0 26-25V51a26 26 0 0 0-26-25zm0 51l-102 64L26 77V51l102 64 102-64z';

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow(
      'mailto:',
      {
        subject: shareMenu.title,
        body: `${shareMenu.text}\n\n${shareMenu.url}`,
      },
      true,
    );
  }
}

window.customElements.define('share-target-email', EmailShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-email': EmailShareTarget;
  }
}
