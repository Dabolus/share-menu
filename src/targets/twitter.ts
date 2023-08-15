import { updateArrayAttribute, updateStringAttribute } from '../helpers.js';
import type { ShareMenu, ShareTarget } from '../share-menu.js';

export class TwitterShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'Twitter';
  public readonly color = '1da1f2';
  public readonly icon =
    'M256 49a105 105 0 0 1-30 8 53 53 0 0 0 23-29 106 106 0 0 1-33 13 53 53 0 0 0-90 48A149 149 0 0 1 18 34a53 53 0 0 0 16 70 53 53 0 0 1-24-7v1a53 53 0 0 0 42 51 53 53 0 0 1-13 2 50 50 0 0 1-10-1 53 53 0 0 0 49 37 105 105 0 0 1-66 22 112 112 0 0 1-12-1 148 148 0 0 0 81 24c96 0 149-80 149-149v-7a105 105 0 0 0 26-27z';

  /**
   * The source to attribute the Tweet to.
   * The attribution will appear in a Tweet as ` via @username` translated into the language of the Tweet author.
   * A `via` parameter may be auto-populated from a link or anchor element linked to a Twitter profile page with a `me` relationship token.
   *
   * @return {string | null}
   */
  public get via(): string | null {
    return this.getAttribute('via');
  }

  public set via(val: string | null | undefined) {
    updateStringAttribute(this, 'via', val);
  }

  /**
   * A comma-separated list of hashtags.
   * Omit a preceding "#" from each hashtag; the Tweet composer will automatically
   * add the proper space-separated hashtag by language.
   *
   * @return {string[]}
   */
  public get hashtags(): string[] {
    return this.getAttribute('hashtags')?.split(',') || [];
  }

  public set hashtags(val: string[] | null | undefined) {
    updateArrayAttribute(this, 'hashtags', val);
  }

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://twitter.com/intent/tweet', {
      text: `${shareMenu.title}\n${shareMenu.text}`,
      url: shareMenu.url,
      via: this.via,
      hashtags: this.hashtags?.join(','),
    });
  }
}

customElements.define('share-target-twitter', TwitterShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-twitter': TwitterShareTarget;
  }
}
