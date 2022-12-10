import type { ShareMenu, ShareTarget } from '../share-menu';

export class WhatsAppShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'WhatsApp';
  public readonly color = '25d366';
  public readonly icon =
    'M256 125c0 69-56 124-126 124a126 126 0 0 1-60-15L0 256l23-67a123 123 0 0 1-18-64 125 125 0 0 1 251 0zM130 20C72 20 25 67 25 125a104 104 0 0 0 20 61l-13 39 40-13a106 106 0 0 0 58 18c59 0 106-47 106-105S189 20 130 20zm64 133l-6-3-21-10c-3-1-5-2-7 1l-10 12c-2 2-3 3-6 1s-13-5-25-15a92 92 0 0 1-17-21c-2-3-1-5 1-6l5-6a20 20 0 0 0 3-5 6 6 0 0 0-1-5l-9-23c-2-6-5-5-7-5h-6a11 11 0 0 0-8 4c-3 3-11 10-11 25s11 30 13 32 21 34 52 46 32 8 37 7 18-7 21-14 3-13 2-15z';

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('whatsapp://send', {
      text: `*${shareMenu.title}*\n\n${shareMenu.text}\n\n${shareMenu.url}`,
    });
  }
}

window.customElements.define('share-target-whatsapp', WhatsAppShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-whatsapp': WhatsAppShareTarget;
  }
}
