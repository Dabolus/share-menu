import { html, fixture } from '@open-wc/testing';
import { ShareMenu, ShareMenuShareEventPayload } from '../src/share-menu.js';

export const createShareMenu = async () => {
  const shareMenu = await fixture<ShareMenu>(html`
    <share-menu url="https://www.example.com">
      <share-target-preset-all facebook-app-id="test"></share-target-preset-all>
    </share-menu>
  `);
  shareMenu.shadowRoot
    ?.querySelector('slot')
    ?.dispatchEvent(new Event('slotchange'));
  return shareMenu;
};

export const createTargetOpener =
  (shareMenu: ShareMenu) =>
  (target?: string): Promise<ShareMenuShareEventPayload> =>
    new Promise((resolve) => {
      shareMenu.addEventListener('share', ({ detail }) => resolve(detail), {
        once: true,
      });
      shareMenu.share();
      shareMenu.shadowRoot
        ?.querySelector<HTMLButtonElement>(
          target
            ? `button.target#${target}`
            : '#targets-container > button.target',
        )
        ?.click();
    });
