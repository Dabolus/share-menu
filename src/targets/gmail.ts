import type { ShareMenu, ShareTarget } from '../share-menu';

export class GmailShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'Gmail';
  public readonly color = 'ea4335';
  public readonly icon =
    'M0 207V58c0-21 25-34 42-21l86 65 86-65c17-13 42 0 42 21v149c0 9-8 17-17 17h-41v-99l-70 52-70-52v99H17c-9 0-17-8-17-17Z';

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://mail.google.com/mail', {
      view: 'cm',
      su: shareMenu.title,
      body: `${shareMenu.text}\n\n${shareMenu.url}`,
    });
  }
}

window.customElements.define('share-target-gmail', GmailShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-gmail': GmailShareTarget;
  }
}
