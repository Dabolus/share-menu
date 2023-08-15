import { updateArrayAttribute } from '../helpers.js';
import type { ShareMenu, ShareTarget } from '../share-menu.js';

export class TumblrShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'Tumblr';
  public readonly color = '35465c';
  public readonly icon =
    'M150 209c-4-2-8-7-9-11l-2-27v-66h60V59h-60V0h-36q-3 20-9 33a70 70 0 0 1-18 22c-7 6-19 10-29 14v36h35v90q0 17 4 27t13 17a68 68 0 0 0 23 13 80 80 0 0 0 28 4 130 130 0 0 0 29-3 157 157 0 0 0 30-11v-40q-19 12-39 12a38 38 0 0 1-20-5z';

  /**
   * A comma-separated list of tags.
   *
   * @return {string[]}
   */
  public get tags(): string[] {
    return this.getAttribute('tags')?.split(',') || [];
  }

  public set tags(val: string[] | null | undefined) {
    updateArrayAttribute(this, 'tags', val);
  }

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://www.tumblr.com/widgets/share/tool', {
      canonicalUrl: shareMenu.url,
      title: shareMenu.title,
      caption: shareMenu.text,
      tags: this.tags?.join(','),
    });
  }
}

customElements.define('share-target-tumblr', TumblrShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-tumblr': TumblrShareTarget;
  }
}
