import { updateArrayAttribute, updateStringAttribute } from '../helpers.js';
import type { ShareMenu, ShareTarget } from '../share-menu.js';

export class XShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'X';
  public readonly color = '000';
  public readonly icon =
    'M202 12h39l-86 99 101 133h-79l-62-81-71 81H5l91-105L0 12h81l56 74 65-74Zm-13 209h21L70 35H46l143 186Z';

  /**
   * The source to attribute the post to.
   * The attribution will appear in a post as ` via @username` translated into the language of the post author.
   * A `via` parameter may be auto-populated from a link or anchor element linked to an X profile page with a `me` relationship token.
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
   * Omit a preceding "#" from each hashtag; the post composer will automatically
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
    shareMenu.openWindow('https://x.com/intent/post', {
      text: `${shareMenu.title}\n${shareMenu.text}`,
      url: shareMenu.url,
      via: this.via ?? undefined,
      ...(this.hashtags.length > 0 && { hashtags: this.hashtags.join(',') }),
    });
  }
}

customElements.define('share-target-x', XShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-x': XShareTarget;
  }
}
