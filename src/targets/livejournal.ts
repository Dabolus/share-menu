import type { ShareMenu, ShareTarget } from '../share-menu';

export class LiveJournalShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'LiveJournal';
  public readonly color = '004359';
  public readonly icon =
    'M135 16a119 119 0 0 0-46 9L64 1a2 2 0 0 0-2-1A185 185 0 0 0 2 60a2 2 0 0 0 0 3l24 24a119 119 0 0 0-11 49A120 120 0 1 0 135 16zm47 109l9 35 8 37-38-8-35-8-95-95a116 116 0 0 1 57-56z"/><path d="M186 157l-6-27a99 99 0 0 0-49 49l28 6a62 62 0 0 1 27-28z';

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://www.livejournal.com/update.bml', {
      subject: shareMenu.title,
      event: `${shareMenu.text}\n\n${shareMenu.url}`,
    });
  }
}

window.customElements.define(
  'share-target-livejournal',
  LiveJournalShareTarget,
);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-livejournal': LiveJournalShareTarget;
  }
}
