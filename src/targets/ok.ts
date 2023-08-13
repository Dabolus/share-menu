import type { ShareMenu, ShareTarget } from '../share-menu';

export class OKShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'OK';
  public readonly color = 'ee8208';
  public readonly icon =
    'M128 39a27 27 0 1 1-27 27 27 27 0 0 1 27-27zm0 93a66 66 0 1 0-66-66 66 66 0 0 0 66 66zm27 54a124 124 0 0 0 38-16 19 19 0 0 0-21-33 84 84 0 0 1-89 0 19 19 0 0 0-20 33 124 124 0 0 0 38 16l-37 37a19 19 0 0 0 28 27l36-36 36 36a19 19 0 0 0 28-27l-37-37z';

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://connect.ok.ru/dk', {
      cmd: 'WidgetSharePreview',
      'st.cmd': 'WidgetSharePreview',
      'st.title': shareMenu.title,
      'st.description': shareMenu.text,
      'st.shareUrl': shareMenu.url,
      'st.imageUrl':
        shareMenu.image ||
        document.querySelector<HTMLMetaElement>("meta[property='og:image']")
          ?.content,
    });
  }
}

customElements.define('share-target-ok', OKShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-ok': OKShareTarget;
  }
}
