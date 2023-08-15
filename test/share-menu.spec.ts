import { html, fixture, expect, chai } from '@open-wc/testing';
import chaiAsPromised from '@esm-bundle/chai-as-promised';
import { sendKeys } from '@web/test-runner-commands';
import { fake } from 'sinon';
import { createShareMenu, createTargetOpener } from './test-helpers.js';
import { ShareMenu, ShareMenuShareEvent } from '../src/share-menu.js';
import '../src/share-menu.js';
import '../src/targets/presets/all.js';

chai.use(chaiAsPromised);

describe('share menu', () => {
  describe('native share via Web Share API', async () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const fakeShare = fake(async () => {});
    const shareMenu = await fixture<ShareMenu>(
      html`<share-menu url="https://www.example.com">></share-menu>`,
    );

    it('uses the Web Share API', async () => {
      window.navigator.share = fakeShare;

      await expect(shareMenu.share()).to.be.fulfilled;
      expect(fakeShare.calledOnce).to.equal(true);
    });

    it("emits a 'share' event with 'native' as origin", async () => {
      window.navigator.share = fakeShare;

      const listener = fake(({ detail: { origin } }: ShareMenuShareEvent) => {
        expect(origin).to.equal('native');
      });
      shareMenu.addEventListener('share', listener, { once: true });
      await shareMenu.share();
      expect(listener.calledOnce).to.equal(true);
    });
  });

  describe('share via fallback dialog', () => {
    it("emits a 'share' event with 'fallback' as origin", async () => {
      const shareMenu = await createShareMenu();
      const openTarget = createTargetOpener(shareMenu);

      // @ts-ignore We need to simulate the Web Share API not being available
      delete window.navigator.share;

      const { origin } = await openTarget();
      expect(origin).to.equal('fallback');
    });

    it('gets triggered if navigator.share throws', async () => {
      const shareMenu = await createShareMenu();
      const openTarget = createTargetOpener(shareMenu);

      const fakeBrokenShare = fake.rejects(undefined);
      window.navigator.share = fakeBrokenShare;

      const { origin } = await openTarget();
      expect(origin).to.equal('fallback');

      // @ts-ignore We need to simulate the Web Share API not being available
      delete window.navigator.share;
    });

    it("doesn't get triggered if navigator.share throws an 'AbortError'", () =>
      new Promise<void>(async (resolve) => {
        const shareMenu = await createShareMenu();

        const abortError = new Error();
        abortError.name = 'AbortError';
        const fakeBrokenShare = fake.rejects(abortError);
        window.navigator.share = fakeBrokenShare;

        shareMenu.addEventListener(
          'close',
          ({ detail: { origin } }) => {
            expect(origin).to.equal('native');
            resolve();
          },
          { once: true },
        );
        await shareMenu.share();

        // @ts-ignore We need to simulate the Web Share API not being available
        delete window.navigator.share;
      }));

    describe('a11y', () => {
      it('generates an accessible markup', async () => {
        const shareMenu = await createShareMenu();
        await expect(shareMenu).to.be.accessible();
      });

      it('focuses the first target when pressing Tab on the copy to clipboard button', async () => {
        const shareMenu = await createShareMenu();
        const firstTarget =
          shareMenu.shadowRoot?.querySelector<HTMLButtonElement>(
            '#targets-container > button.target:first-of-type',
          );
        const copyToClipboardButton =
          shareMenu.shadowRoot?.querySelector<HTMLButtonElement>(
            '.target#clipboard',
          );

        shareMenu.share();
        copyToClipboardButton?.focus();

        await sendKeys({ press: 'Tab' });

        const activeEl =
          shareMenu.shadowRoot?.activeElement || document.activeElement;

        expect(activeEl?.id).to.equal(firstTarget?.id);
      });

      it('focuses the last target when pressing Shift+Tab on the copy to clipboard button', async () => {
        const shareMenu = await createShareMenu();
        const lastTarget =
          shareMenu.shadowRoot?.querySelector<HTMLButtonElement>(
            '#targets-container > button.target:last-of-type',
          );
        const copyToClipboardButton =
          shareMenu.shadowRoot?.querySelector<HTMLButtonElement>(
            '.target#clipboard',
          );

        shareMenu.share();
        copyToClipboardButton?.focus();

        await sendKeys({ press: 'Shift+Tab' });

        const activeEl =
          shareMenu.shadowRoot?.activeElement || document.activeElement;

        expect(activeEl?.id).to.equal(lastTarget?.id);
      });

      it('closes when pressing the Escape character', async () => {
        const shareMenu = await createShareMenu();

        const waitForCloseEventPromise = new Promise((resolve) => {
          shareMenu.addEventListener('close', () => resolve(true), {
            once: true,
          });
        });

        shareMenu.share();
        const event = new KeyboardEvent('keydown', { key: 'Escape' });
        shareMenu.dispatchEvent(event);
        await waitForCloseEventPromise;
        expect(shareMenu.opened).to.equal(false);
      });

      it('closes when clicking on the backdrop', async () => {
        const shareMenu = await createShareMenu();

        const waitForCloseEventPromise = new Promise((resolve) => {
          shareMenu.addEventListener('close', () => resolve(true), {
            once: true,
          });
        });

        shareMenu.share();
        shareMenu.shadowRoot
          ?.querySelector<HTMLDivElement>('#backdrop')
          ?.click();
        await waitForCloseEventPromise;
        expect(shareMenu.opened).to.equal(false);
      });
    });

    describe('opened', () => {
      it('syncs opened property with opened attribute', async () => {
        const shareMenu = await createShareMenu();
        shareMenu.setAttribute('opened', '');
        expect(shareMenu.opened).to.equal(true);
        shareMenu.removeAttribute('opened');
        expect(shareMenu.opened).to.equal(false);

        shareMenu.opened = true;
        expect(shareMenu.getAttribute('opened')).to.be.a.string;
        shareMenu.opened = false;
        expect(shareMenu.getAttribute('opened')).to.be.null;
      });

      it('opens the share menu when set to true', () => async () => {
        const shareListener = fake();
        const shareMenu = await createShareMenu();
        shareMenu.opened = false;
        shareMenu.addEventListener('share', shareListener, { once: true });
        shareMenu.opened = true;
        expect(shareListener.calledOnce).to.equal(true);
      });

      it('closes the share menu when set to false', () => async () => {
        const closeListener = fake();
        const shareMenu = await createShareMenu();
        shareMenu.opened = true;
        shareMenu.addEventListener('close', closeListener, { once: true });
        shareMenu.opened = false;
        expect(closeListener.calledOnce).to.equal(true);
      });
    });

    describe('dialog title', async () => {
      const shareMenu = await createShareMenu();

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
          shareMenu.shadowRoot?.querySelector<HTMLHeadingElement>('#title')
            ?.textContent,
        ).to.equal('Test title');
      });

      it('it correctly sets the dialogTitle property if initialized with the dialog-title attribute', async () => {
        const dialogTitleShareMenu = await fixture<ShareMenu>(html`
          <share-menu dialog-title="dialogTitle"></share-menu>
        `);

        expect(dialogTitleShareMenu.dialogTitle).to.equal('dialogTitle');
      });

      it('defaults to "Share" if dialog-title attribute is not passed', async () => {
        const noDialogTitleShareMenu = await fixture<ShareMenu>(html`
          <share-menu></share-menu>
        `);

        expect(noDialogTitleShareMenu.dialogTitle).to.equal('Share');
      });
    });

    describe('text', async () => {
      const shareMenu = await createShareMenu();

      it('syncs text property with text attribute', () => {
        shareMenu.setAttribute('text', 'Test text');
        expect(shareMenu.text).to.equal('Test text');

        shareMenu.text = 'Another test text';
        expect(shareMenu.getAttribute('text')).to.equal('Another test text');
      });

      it('it correctly sets the text property if initialized with the text attribute', async () => {
        const descriptionShareMenu = await fixture<ShareMenu>(html`
          <share-menu text="text"></share-menu>
        `);

        expect(descriptionShareMenu.text).to.equal('text');
      });

      it('defaults to an empty string if text attribute is not passed and meta description is not set', async () => {
        const noDescriptionShareMenu = await fixture<ShareMenu>(html`
          <share-menu></share-menu>
        `);

        expect(noDescriptionShareMenu.text).to.equal('');
      });

      it('defaults to meta description if it is available and text attribute is not passed', async () => {
        const metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        metaDescription.content = 'text';
        document.head.appendChild(metaDescription);

        const noDescriptionShareMenu = await fixture<ShareMenu>(html`
          <share-menu></share-menu>
        `);

        expect(noDescriptionShareMenu.text).to.equal('text');

        document.head.removeChild(metaDescription);
      });
    });

    describe('title', async () => {
      const shareMenu = await createShareMenu();

      it('syncs title property with title attribute', () => {
        shareMenu.setAttribute('title', 'Test title');
        expect(shareMenu.title).to.equal('Test title');

        shareMenu.title = 'Another test title';
        expect(shareMenu.getAttribute('title')).to.equal('Another test title');
      });

      it('it correctly sets the title property if initialized with the title attribute', async () => {
        const titleShareMenu = await fixture<ShareMenu>(html`
          <share-menu title="title"></share-menu>
        `);

        expect(titleShareMenu.title).to.equal('title');
      });

      it('defaults to current window title if title attribute is not passed', async () => {
        const noTitleShareMenu = await fixture<ShareMenu>(html`
          <share-menu></share-menu>
        `);

        expect(noTitleShareMenu.title).to.equal(document.title);
      });
    });

    describe('url', async () => {
      const shareMenu = await createShareMenu();

      it('syncs url property with url attribute', () => {
        shareMenu.setAttribute('url', 'Test url');
        expect(shareMenu.url).to.equal('Test url');

        shareMenu.url = 'Another test url';
        expect(shareMenu.getAttribute('url')).to.equal('Another test url');
      });

      it('it correctly sets the url property if initialized with the url attribute', async () => {
        const urlShareMenu = await fixture<ShareMenu>(html`
          <share-menu url="url"></share-menu>
        `);

        expect(urlShareMenu.url).to.equal('url');
      });

      it('defaults to current URL if url attribute is not passed and canonical URL is not set', async () => {
        const noUrlShareMenu = await fixture<ShareMenu>(html`
          <share-menu></share-menu>
        `);

        expect(noUrlShareMenu.url).to.equal(window.location.href);
      });

      it('defaults to canonical URL if it is available and url attribute is not passed', async () => {
        const canonicalUrl = document.createElement('link');
        canonicalUrl.rel = 'canonical';
        canonicalUrl.href = 'https://example.com/canonical';
        document.head.appendChild(canonicalUrl);

        const noUrlShareMenu = await fixture<ShareMenu>(html`
          <share-menu></share-menu>
        `);

        expect(noUrlShareMenu.url).to.equal('https://example.com/canonical');

        document.head.removeChild(canonicalUrl);
      });
    });

    describe('no backdrop', async () => {
      const shareMenu = await createShareMenu();

      it('syncs noBackdrop property with no-backdrop attribute', () => {
        shareMenu.setAttribute('no-backdrop', '');
        expect(shareMenu.noBackdrop).to.equal(true);
        shareMenu.removeAttribute('no-backdrop');
        expect(shareMenu.noBackdrop).to.equal(false);

        shareMenu.noBackdrop = true;
        expect(shareMenu.getAttribute('no-backdrop')).to.be.a.string;
        shareMenu.noBackdrop = false;
        expect(shareMenu.getAttribute('no-backdrop')).to.be.null;
      });
    });
  });

  describe('open window helper', () => {
    const backupOpen = window.open;

    it('opens the given URL in a new window if replace param is falsy', async () => {
      const shareMenu = await fixture<ShareMenu>(
        html`<share-menu></share-menu>`,
      );
      const urlToOpen = 'https://example.com';
      const fakeOpen = fake((url: string | URL, target: string) => {
        expect(url).to.equal(urlToOpen);
        expect(target).to.equal('_blank');
        return window;
      });
      window.open = fakeOpen;
      shareMenu.openWindow(urlToOpen, {}, false);
      window.open = backupOpen;
    });

    it('opens the given URL in the same window if replace param is truthy', async () => {
      const shareMenu = await fixture<ShareMenu>(
        html`<share-menu></share-menu>`,
      );
      const urlToOpen = 'https://example.com';
      const fakeOpen = fake((url: string | URL, target: string) => {
        expect(url).to.equal(urlToOpen);
        expect(target).to.equal('_self');
        return window;
      });
      window.open = fakeOpen;
      shareMenu.openWindow(urlToOpen, {}, true);
      window.open = backupOpen;
    });
  });
});
