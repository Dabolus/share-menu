import type { ShareMenu, ShareTarget } from '../share-menu';

export class KakaoTalkShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'KakaoTalk';
  public readonly color = 'ffe812';
  public readonly icon =
    'M128 9.9c70.7 0 128 45.2 128 100.9s-57.3 101-128 101c-7.8 0-15.4-.6-22.7-1.7-7.4 5.2-50 35.2-54.1 35.8 0 0-1.7.6-3-.2-1.5-.8-1.2-3-1.2-3 .4-2.9 11-39.6 13-46.4-36-17.8-60-49.5-60-85.5 0-55.7 57.3-101 128-101ZM57.2 146c4.1 0 7.4-3.1 7.4-7V95h11.5a7.2 7.2 0 0 0 0-14.4H38.3a7.2 7.2 0 0 0 0 14.4h11.5v44c0 3.9 3.4 7 7.4 7Zm124.1 0c4 0 7.4-3.4 7.4-7.4v-16.2l2.6-2.5 17.3 23a7.3 7.3 0 0 0 10.3 1.4 7.3 7.3 0 0 0 1.5-10.4l-18.2-24L219 93a5.8 5.8 0 0 0 1.7-4.5 7.3 7.3 0 0 0-2.2-4.7 7.3 7.3 0 0 0-5-2.1c-1.7 0-3.1.5-4.2 1.6l-20.6 20.6V88a7.4 7.4 0 0 0-14.8 0v50.6c0 4 3.4 7.3 7.4 7.3Zm-41-1H164c3.9 0 7-3 7-6.8a7 7 0 0 0-7-6.8h-15.7V88c0-4-3.4-7.3-7.5-7.3a7.5 7.5 0 0 0-7.6 7.3v50.2a7 7 0 0 0 7.1 6.8Zm-18.3 1c1.6 0 3.2-.4 4.7-1 2-1 4-3.6 1.7-10.6L110.8 88c-1.3-3.5-5-7.1-9.9-7.2-4.8 0-8.6 3.7-9.8 7.2l-17.7 46.5c-2.2 7-.3 9.6 1.8 10.5 1.4.7 3 1 4.7 1 3 0 5.4-1.2 6.1-3.2l3.7-9.6h22.5l3.6 9.6c.7 2 3.1 3.2 6.2 3.2Zm-13.7-26H93.5l7.4-21 7.4 21Z';

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://story.kakao.com/share', {
      url: shareMenu.url,
    });
  }
}

customElements.define('share-target-kakaotalk', KakaoTalkShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-kakaotalk': KakaoTalkShareTarget;
  }
}
