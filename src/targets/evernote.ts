import type { ShareMenu, ShareTarget } from '../share-menu';

export class EverNoteShareTarget extends HTMLElement implements ShareTarget {
  public readonly displayName = 'EverNote';
  public readonly color = '2dbe60';
  public readonly icon =
    'M70 55H29L81 3v42zm147-21c-4-7-27-16-39-16h-31a39 39 0 0 0-33-18C90 0 92 10 92 19v36L81 66H32S18 76 18 95s7 89 48 95c48 8 57-15 57-18v-29s14 28 36 28 34 12 34 25v23s-1 15-14 15h-27s-9-7-9-16 5-13 10-13a73 73 0 0 1 9 1v-20s-41 0-41 31 21 39 39 39h27s51-6 51-106-16-108-21-116zm-49 89s2-16 11-16 23 22 23 22l-34-6z';

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://www.evernote.com/clip.action', {
      url: shareMenu.url,
      title: shareMenu.title,
    });
  }
}

window.customElements.define('share-target-evernote', EverNoteShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-evernote': EverNoteShareTarget;
  }
}
