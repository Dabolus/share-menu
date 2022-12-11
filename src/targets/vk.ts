import type { ShareMenu, ShareTarget } from '../share-menu';

export class VKShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'VK';
  public readonly color = '45668e';
  public readonly icon =
    'M250 62c2-6 0-10-8-10h-28c-7 0-11 4-13 8 0 0-14 35-34 57-6 7-9 9-13 9-2 0-4-2-4-8V62c0-7-2-10-8-10H98a7 7 0 0 0-7 6c0 7 10 9 11 28v41c0 9-2 11-5 11-10 0-33-35-47-75-3-8-5-11-12-11H10c-8 0-10 4-10 8 0 7 10 44 44 93 23 33 56 51 86 51 17 0 20-4 20-11v-25c0-8 1-10 7-10 4 0 11 2 28 18 19 19 22 28 33 28h28c8 0 12-4 9-12s-11-19-23-33l-20-20c-4-5-3-8 0-12 0 0 35-48 38-65z';

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://vk.com/share.php', {
      url: shareMenu.url,
      title: shareMenu.title,
      comment: shareMenu.text,
    });
  }
}

window.customElements.define('share-target-vk', VKShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-vk': VKShareTarget;
  }
}
