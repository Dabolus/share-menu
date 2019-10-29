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
    const shareMenu: ShareMenu = await fixture(html`
      <share-menu></share-menu>
    `);

    it('uses the Web Share API', async () => {
      (window.navigator as NavigatorWithShare).share = fakeShare;

      await expect(() => shareMenu.share()).not.to.throw();
      expect(fakeShare.calledOnce).to.equal(true);
    });

    it("emits a 'share' event with 'native' as origin", async () => {
      (window.navigator as NavigatorWithShare).share = fakeShare;

      const listener = fake(({ detail: { origin } }: CustomEvent) => {
        expect(origin).to.equal('native');
      });
      shareMenu.addEventListener('share', listener, { once: true });
      await shareMenu.share();
      expect(listener.calledOnce).to.equal(true);
    });
  });

  describe('share via fallback dialog', async () => {
    const shareMenu: ShareMenu = await fixture(html`
      <share-menu is-image="yes"></share-menu>
    `);

    it("emits a 'share' event with 'fallback' as origin", async () => {
      delete (window.navigator as NavigatorWithShare).share;

      const listener = fake(({ detail: { origin } }: CustomEvent) => {
        expect(origin).to.equal('fallback');
      });
      shareMenu.addEventListener('share', listener, { once: true });
      const sharePromise = shareMenu.share();
      // We need to click a social to correctly resolve the promise
      shareMenu.shadowRoot
        .querySelector<HTMLButtonElement>('button.social')
        .click();
      await sharePromise;
      expect(listener.calledOnce).to.equal(true);
    });

    describe('socials', () => {
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

    describe('opened', () => {
      it('syncs opened property with opened attribute', () => {
        shareMenu.setAttribute('opened', '');
        expect(shareMenu.opened).to.equal(true);

        shareMenu.opened = false;
        expect(shareMenu.getAttribute('opened')).to.be.null;
      });

      // TODO: maybe add some specs to make sure that changing this attribute opens/closes the share menu
    });

    describe('dialog title', () => {
      it('syncs dialogTitle property with dialog-title attribute', () => {
        shareMenu.setAttribute('dialog-title', 'Test title');
        expect(shareMenu.dialogTitle).to.equal('Test title');

        shareMenu.dialogTitle = 'Another test title';
        expect(shareMenu.getAttribute('dialog-title')).to.equal(
          'Another test title',
        );
      });

      it('updates the title in the HTML', () => {
        shareMenu.dialogTitle = 'Test title';
        expect(
          shareMenu.shadowRoot.querySelector<HTMLHeadingElement>('#title')
            .textContent,
        ).to.equal('Test title');
      });
    });

    describe('text', () => {
      it('syncs text property with text attribute', () => {
        shareMenu.setAttribute('text', 'Test text');
        expect(shareMenu.text).to.equal('Test text');

        shareMenu.text = 'Another test text';
        expect(shareMenu.getAttribute('text')).to.equal('Another test text');
      });
    });

    describe('title', () => {
      it('syncs title property with title attribute', () => {
        shareMenu.setAttribute('title', 'Test title');
        expect(shareMenu.title).to.equal('Test title');

        shareMenu.title = 'Another test title';
        expect(shareMenu.getAttribute('title')).to.equal('Another test title');
      });
    });

    describe('url', () => {
      it('syncs url property with url attribute', () => {
        shareMenu.setAttribute('url', 'Test url');
        expect(shareMenu.url).to.equal('Test url');

        shareMenu.url = 'Another test url';
        expect(shareMenu.getAttribute('url')).to.equal('Another test url');
      });
    });

    describe('via', () => {
      it('syncs via property with via attribute', () => {
        shareMenu.setAttribute('via', 'Test via');
        expect(shareMenu.via).to.equal('Test via');

        shareMenu.via = 'Another test via';
        expect(shareMenu.getAttribute('via')).to.equal('Another test via');
      });
    });
  });
});
