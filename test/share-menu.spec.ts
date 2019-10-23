import { html, fixture, expect } from '@open-wc/testing';
import { fake } from 'sinon';
import '../src/share-menu';
import { ShareMenu } from '../src/share-menu';

// We need to do this because navigator.share does not currently exist in TypeScript typings
interface ShareOptions {
  url?: string;
  text?: string;
  title?: string;
}

interface NavigatorWithShare extends Navigator {
  share: (options: ShareOptions) => Promise<void>;
}

describe('share menu', () => {
  describe('native share via Web Share API', async () => {
    const fakeShare = fake(async () => {});
    (window.navigator as NavigatorWithShare).share = fakeShare;

    const shareMenu: ShareMenu = await fixture(html`
      <share-menu></share-menu>
    `);

    it('uses the Web Share API if available', async () => {
      await expect(() => shareMenu.share()).not.to.throw();
      expect(fakeShare.calledOnce).to.equal(true);
    });

    it("emits a 'share' event with 'native' as origin", async () => {
      const listener = fake(({ detail: { origin } }: CustomEvent) => {
        expect(origin).to.equal('native');
      });
      shareMenu.addEventListener('share', listener);
      await shareMenu.share();
      shareMenu.removeEventListener('share', listener);
      expect(listener.calledOnce).to.equal(true);
    });
  });

  describe('share via fallback dialog', () => {
    describe('socials', async () => {
      const shareMenu: ShareMenu = await fixture(html`
        <share-menu is-image="yes"></share-menu>
      `);

      it('defaults to all of them unless specified', () => {
        expect(shareMenu.socials).to.deep.equal(
          Object.keys(shareMenu['_supportedSocials']),
        );
      });

      it('creates a button for each social', () => {
        const buttons = shareMenu.shadowRoot.querySelectorAll<
          HTMLButtonElement
        >('button.social');

        expect(buttons.length).to.equal(shareMenu.socials.length);
        buttons.forEach((button, index) => {
          expect(button.title).to.equal(
            shareMenu['_supportedSocials'][shareMenu.socials[index]].title,
          );
        });
      });

      it('creates a button only for the specified socials and in the specified order', () => {
        shareMenu.socials = ['facebook', 'skype', 'telegram'];
        const buttons = shareMenu.shadowRoot.querySelectorAll<
          HTMLButtonElement
        >('button.social');

        expect(buttons.length).to.equal(3);
        expect(buttons[0].title).to.equal(
          shareMenu['_supportedSocials'].facebook.title,
        );
        expect(buttons[1].title).to.equal(
          shareMenu['_supportedSocials'].skype.title,
        );
        expect(buttons[2].title).to.equal(
          shareMenu['_supportedSocials'].telegram.title,
        );
      });
    });
  });
});
