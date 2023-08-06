import type { ShareMenu, ShareTarget } from '../share-menu';

export class SubstackShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'Substack';
  public readonly hint = 'Notes';
  public readonly color = 'ff681a';
  public readonly icon =
    'M16 0h224v31H16V0Zm0 115h224v141l-112-63-112 63V115Zm0-58h224v32H16V57Z';

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://substack.com/notes', {
      action: 'compose',
      message: `${shareMenu.title}\n\n${shareMenu.text}\n\n${shareMenu.url}`,
    });
  }
}

window.customElements.define('share-target-substack', SubstackShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-substack': SubstackShareTarget;
  }
}
