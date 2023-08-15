import type { ShareMenu, ShareTarget } from '../share-menu.js';

export class TelegramShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'Telegram';
  public readonly color = '08c';
  public readonly icon =
    'M5 123l59 22 22 74a7 7 0 0 0 11 3l33-27a10 10 0 0 1 12 0l60 43a7 7 0 0 0 10-4l44-209a7 7 0 0 0-9-8L4 110a7 7 0 0 0 1 13zm78 11l115-71a2 2 0 0 1 2 3l-95 88a20 20 0 0 0-6 12l-3 24a3 3 0 0 1-6 1l-12-44a12 12 0 0 1 5-13z';

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://t.me/share/url', {
      url: shareMenu.url,
      text: `**${shareMenu.title}**\n${shareMenu.text}`,
    });
  }
}

customElements.define('share-target-telegram', TelegramShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-telegram': TelegramShareTarget;
  }
}
