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

interface CustomNavigator extends Navigator {
  share: (options: ShareOptions) => Promise<void>;
  clipboard: Clipboard;
}

// We need to do this because of window.FB (Facebook JS API)
interface FB {
  ui: (options: {
    href?: string;
    method?: string;
    mobile_iframe?: boolean;
    quote?: string;
  }) => void;
}

interface CustomWindow extends Window {
  navigator: CustomNavigator;
  FB?: FB;
}

declare const window: CustomWindow;

describe('share menu', () => {
  describe('native share via Web Share API', async () => {
    const fakeShare = fake(async () => {});
    const shareMenu: ShareMenu = await fixture(html`
      <share-menu></share-menu>
    `);

    it('uses the Web Share API', async () => {
      window.navigator.share = fakeShare;

      await expect(() => shareMenu.share()).not.to.throw();
      expect(fakeShare.calledOnce).to.equal(true);
    });

    it("emits a 'share' event with 'native' as origin", async () => {
      window.navigator.share = fakeShare;

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

    interface ShareResult {
      origin: 'fallback';
      social: string;
    }

    const openSocial = (social?: string): Promise<ShareResult> =>
      new Promise(resolve => {
        shareMenu.addEventListener(
          'share',
          (({ detail }: CustomEvent) => resolve(detail)) as any,
          { once: true },
        );
        shareMenu.share();
        shareMenu.shadowRoot
          .querySelector<HTMLButtonElement>(
            `button.social${social ? `#${social}` : ''}`,
          )
          .click();
      });

    it("emits a 'share' event with 'fallback' as origin", async () => {
      delete window.navigator.share;

      const { origin } = await openSocial();
      expect(origin).to.equal('fallback');
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

        // Restore socials
        shareMenu.socials = Object.keys(shareMenu['_supportedSocials']);
      });

      describe('clipboard', () => {
        const clipboardBackup = window.navigator.clipboard;
        Object.defineProperty(window.navigator, 'clipboard', {
          value: clipboardBackup,
          configurable: true,
          writable: true,
        });

        it('writes to clipboard', async () => {
          const fakeClipboardWriteText = fake.resolves(undefined);
          window.navigator.clipboard.writeText = fakeClipboardWriteText;

          await openSocial('clipboard');
          expect(fakeClipboardWriteText.calledOnce).to.equal(true);

          window.navigator.clipboard = clipboardBackup;
        });

        it('emits an error event if writing to clipboard fails', async () => {
          const fakeClipboardWriteText = fake.rejects(new Error());
          window.navigator.clipboard.writeText = fakeClipboardWriteText;

          shareMenu.addEventListener(
            'error',
            (({ detail: { message } }: CustomEvent) => {
              expect(message).to.equal('Unable to copy to clipboard');
            }) as any,
            { once: true },
          );
          const sharePromise = shareMenu.share();
          shareMenu.shadowRoot
            .querySelector<HTMLButtonElement>('button.social#clipboard')
            .click();
          await sharePromise;

          window.navigator.clipboard = clipboardBackup;
        });

        it('emits an error event if navigator.clipboard is not supported', async () => {
          window.navigator.clipboard = undefined;

          shareMenu.addEventListener(
            'error',
            (({ detail: { message } }: CustomEvent) => {
              expect(message).to.equal('Unable to copy to clipboard');
            }) as any,
            { once: true },
          );
          const sharePromise = shareMenu.share();
          shareMenu.shadowRoot
            .querySelector<HTMLButtonElement>('button.social#clipboard')
            .click();
          await sharePromise;

          window.navigator.clipboard = clipboardBackup;
        });
      });

      describe('facebook', () => {
        it('uses Facebook JS API if available', async () => {
          const fakeFBUI = fake();
          window.FB = {
            ui: fakeFBUI,
          };

          await openSocial('facebook');
          expect(fakeFBUI.calledOnce).to.equal(true);

          delete window.FB;
        });

        it('opens a window if Facebook JS API is not available', async () => {
          const openWindowBackup = shareMenu['_openWindow'];
          const fakeOpenWindow = fake();
          shareMenu['_openWindow'] = fakeOpenWindow;

          await openSocial('facebook');
          expect(fakeOpenWindow.calledOnce).to.equal(true);

          shareMenu['_openWindow'] = openWindowBackup;
        });
      });
    });

    describe('opened', () => {
      it('syncs opened property with opened attribute', () => {
        shareMenu.setAttribute('opened', '');
        expect(shareMenu.opened).to.equal(true);
        shareMenu.removeAttribute('opened');
        expect(shareMenu.opened).to.equal(false);

        shareMenu.opened = true;
        expect(shareMenu.getAttribute('opened')).to.be.a.string;
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

    describe('is image', () => {
      it('syncs isImage property with is-image attribute', () => {
        shareMenu.setAttribute('is-image', 'no');
        expect(shareMenu.isImage).to.equal('no');

        shareMenu.isImage = 'yes';
        expect(shareMenu.getAttribute('is-image')).to.equal('yes');
      });
    });

    describe('no backdrop', () => {
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
});
