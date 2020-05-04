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
  platform: string;
  appVersion: string;
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

    it('gets triggered if navigator.share throws', async () => {
      const fakeBrokenShare = fake.rejects(undefined);
      window.navigator.share = fakeBrokenShare;

      const { origin } = await openSocial();
      expect(origin).to.equal('fallback');

      delete window.navigator.share;
    });

    it("doesn't get triggered if navigator.share throws an 'AbortError'", () =>
      new Promise(resolve => {
        const abortError = new Error();
        abortError.name = 'AbortError';
        const fakeBrokenShare = fake.rejects(abortError);
        window.navigator.share = fakeBrokenShare;

        shareMenu.addEventListener(
          'close',
          ({ detail: { origin } }: CustomEvent) => {
            expect(origin).to.equal('native');
            resolve();
          },
          { once: true },
        );
        shareMenu.share();

        delete window.navigator.share;
      }));

    describe('a11y', () => {
      const firstSocial = shareMenu.shadowRoot.querySelector<HTMLButtonElement>(
        'button.social:first-of-type',
      );
      const lastSocial = shareMenu.shadowRoot.querySelector<HTMLButtonElement>(
        'button.social:last-of-type',
      );

      it('generates an accessible markup', async () => {
        // For some reason we need to create a new share menu,
        // otherwise axe will complain about "no elements in frame context"
        const possiblyAccessibleShareMenu: ShareMenu = await fixture(html`
          <share-menu is-image="yes"></share-menu>
        `);

        await expect(possiblyAccessibleShareMenu).to.be.accessible();
      });

      // FIXME: discover why focus isn't working properly in tests and re-enable these two specs
      xit('focuses the last social when pressing Shift+Tab on the first social', async () => {
        shareMenu.share();
        firstSocial.focus();

        const event = new KeyboardEvent('keydown', {
          key: 'Tab',
          shiftKey: true,
        });
        shareMenu.dispatchEvent(event);
        const activeEl =
          shareMenu.shadowRoot.activeElement || document.activeElement;

        expect(activeEl).to.equal(lastSocial);
      });

      xit('focuses the first social when pressing Tab on the last social', async () => {
        shareMenu.share();
        lastSocial.focus();

        const event = new KeyboardEvent('keydown', {
          key: 'Tab',
        });
        shareMenu.dispatchEvent(event);
        const activeEl =
          shareMenu.shadowRoot.activeElement || document.activeElement;

        expect(activeEl).to.equal(firstSocial);
      });

      it('closes when pressing the Escape character', async () => {
        const waitForCloseEventPromise = new Promise(resolve => {
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
        const waitForCloseEventPromise = new Promise(resolve => {
          shareMenu.addEventListener('close', () => resolve(true), {
            once: true,
          });
        });

        shareMenu.share();
        shareMenu.shadowRoot.querySelector<HTMLDivElement>('#backdrop').click();
        await waitForCloseEventPromise;
        expect(shareMenu.opened).to.equal(false);
      });
    });

    describe('socials', () => {
      const openSocialAndCheckWindow = async (
        social: string,
        match = social,
      ) => {
        const openWindowBackup = shareMenu['_openWindow'];
        const fakeOpenWindow = fake((url: string) => {
          expect(url).to.contain(match);
        });
        shareMenu['_openWindow'] = fakeOpenWindow;

        await openSocial(social);
        expect(fakeOpenWindow.calledOnce).to.equal(true);

        shareMenu['_openWindow'] = openWindowBackup;
      };

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

        it('opens a window with Facebook share screen if Facebook JS API is not available', async () => {
          await openSocialAndCheckWindow('facebook');
        });
      });

      describe('twitter', () => {
        it('opens a window with Twitter share screen', async () => {
          await openSocialAndCheckWindow('twitter');
        });

        it('adds the via parameter if via is set', async () => {
          const viaBackup = shareMenu.via;
          shareMenu.via = 'via';
          await openSocialAndCheckWindow('twitter', 'via=');
          shareMenu.via = viaBackup;
        });

        it("doesn't add the via parameter if via isn't set", async () => {
          const viaBackup = shareMenu.via;
          shareMenu.via = '';

          const openWindowBackup = shareMenu['_openWindow'];
          const fakeOpenWindow = fake((url: string) => {
            expect(url).not.to.contain('via=');
          });
          shareMenu['_openWindow'] = fakeOpenWindow;
          await openSocial('twitter');
          expect(fakeOpenWindow.calledOnce).to.equal(true);
          shareMenu['_openWindow'] = openWindowBackup;

          shareMenu.via = viaBackup;
        });
      });

      describe('whatsapp', () => {
        it('opens a window with WhatsApp share screen', async () => {
          await openSocialAndCheckWindow('whatsapp');
        });
      });

      describe('telegram', () => {
        it('opens a window with Telegram share screen', async () => {
          await openSocialAndCheckWindow('telegram', 't.me');
        });
      });

      describe('linkedin', () => {
        it('opens a window with LinkedIn share screen', async () => {
          await openSocialAndCheckWindow('linkedin');
        });
      });

      describe('pinterest', () => {
        it('appends Pinterest script to body', async () => {
          expect(document.body.innerHTML).not.to.contain(
            'assets.pinterest.com',
          );
          await openSocial('pinterest');
          expect(document.body.innerHTML).to.contain('assets.pinterest.com');
        });
      });

      describe('tumblr', () => {
        it('opens a window with Tumblr share screen', async () => {
          await openSocialAndCheckWindow('tumblr');
        });
      });

      describe('reddit', () => {
        it('opens a window with Reddit share screen', async () => {
          await openSocialAndCheckWindow('reddit');
        });

        it('shares an URL if share menu has no text', async () => {
          const textBackup = shareMenu.text;
          shareMenu.text = '';
          await openSocialAndCheckWindow('reddit', 'url=');
          shareMenu.text = textBackup;
        });

        it('shares a text if share menu has text', async () => {
          const textBackup = shareMenu.text;
          shareMenu.text = 'A text';
          await openSocialAndCheckWindow('reddit', 'text=');
          shareMenu.text = textBackup;
        });
      });

      describe('vk', () => {
        it('opens a window with VK share screen', async () => {
          await openSocialAndCheckWindow('vk');
        });
      });

      describe('skype', () => {
        it('opens a window with Skype share screen', async () => {
          await openSocialAndCheckWindow('skype');
        });
      });

      describe('viber', () => {
        it('opens a window with Viber share screen', async () => {
          await openSocialAndCheckWindow('viber');
        });
      });

      describe('line', () => {
        it('opens a window with Line share screen', async () => {
          await openSocialAndCheckWindow('line');
        });
      });

      describe('qzone', () => {
        it('opens a window with Qzone share screen', async () => {
          await openSocialAndCheckWindow('qzone');
        });
      });

      describe('wordpress', () => {
        it('opens a window with WordPress share screen', async () => {
          await openSocialAndCheckWindow('wordpress');
        });

        it('shares an image if URL is an image', async () => {
          const isImageBackup = shareMenu.isImage;
          shareMenu.isImage = 'yes';
          await openSocialAndCheckWindow('wordpress', 'i=');
          shareMenu.isImage = isImageBackup;
        });

        it("doesn't share an image if URL isn't an image", async () => {
          const isImageBackup = shareMenu.isImage;
          shareMenu.isImage = 'no';

          const openWindowBackup = shareMenu['_openWindow'];
          const fakeOpenWindow = fake((url: string) => {
            expect(url).not.to.contain('i=');
          });
          shareMenu['_openWindow'] = fakeOpenWindow;
          await openSocial('wordpress');
          expect(fakeOpenWindow.calledOnce).to.equal(true);
          shareMenu['_openWindow'] = openWindowBackup;

          shareMenu.isImage = isImageBackup;
        });
      });

      describe('blogger', () => {
        it('opens a window with Blogger share screen', async () => {
          await openSocialAndCheckWindow('blogger');
        });
      });

      describe('flipboard', () => {
        it('opens a window with Flipboard share screen', async () => {
          await openSocialAndCheckWindow('flipboard');
        });
      });

      describe('evernote', () => {
        it('opens a window with Evernote share screen', async () => {
          await openSocialAndCheckWindow('evernote');
        });
      });

      describe('myspace', () => {
        it('opens a window with Myspace share screen', async () => {
          await openSocialAndCheckWindow('myspace');
        });
      });

      describe('pocket', () => {
        it('opens a window with Pocket share screen', async () => {
          await openSocialAndCheckWindow('pocket');
        });
      });

      describe('livejournal', () => {
        it('opens a window with LiveJournal share screen', async () => {
          await openSocialAndCheckWindow('livejournal');
        });
      });

      describe('instapaper', () => {
        it('opens a window with Instapaper share screen', async () => {
          await openSocialAndCheckWindow('instapaper');
        });
      });

      describe('baidu', () => {
        it('opens a window with Baidu share screen', async () => {
          await openSocialAndCheckWindow('baidu');
        });
      });

      describe('okru', () => {
        it('opens a window with OK.ru share screen', async () => {
          await openSocialAndCheckWindow('okru', 'ok.ru');
        });
      });

      describe('xing', () => {
        it('opens a window with XING share screen', async () => {
          await openSocialAndCheckWindow('xing');
        });
      });

      describe('buffer', () => {
        it('opens a window with Buffer share screen', async () => {
          await openSocialAndCheckWindow('buffer');
        });
      });

      describe('digg', () => {
        it('opens a window with Digg share screen', async () => {
          await openSocialAndCheckWindow('digg');
        });
      });

      describe('douban', () => {
        it('opens a window with Douban share screen', async () => {
          await openSocialAndCheckWindow('douban');
        });
      });

      describe('stumbleupon', () => {
        it('opens a window with StumbleUpon share screen', async () => {
          await openSocialAndCheckWindow('stumbleupon');
        });
      });

      describe('weibo', () => {
        it('opens a window with Weibo share screen', async () => {
          await openSocialAndCheckWindow('weibo');
        });
      });

      describe('print', () => {
        it('opens a new window at the given URL and prints it', async () => {
          const openWindowBackup = shareMenu['_openWindow'];
          const fakePrint = fake();
          const fakeOpenWindow = () =>
            ({
              print: fakePrint,
            } as any);
          shareMenu['_openWindow'] = fakeOpenWindow;

          await openSocial('print');
          expect(fakePrint.calledOnce).to.equal(true);

          shareMenu['_openWindow'] = openWindowBackup;
        });
      });

      describe('translate', () => {
        it('opens a window with Google Translator translation page', async () => {
          await openSocialAndCheckWindow('translate');
        });
      });

      describe('email', () => {
        it('opens a mailto link', async () => {
          await openSocialAndCheckWindow('email', 'mailto');
        });
      });

      describe('sms', () => {
        const platformBackup = window.navigator.platform;
        Object.defineProperty(window.navigator, 'platform', {
          value: platformBackup,
          configurable: true,
          writable: true,
        });
        const appVersionBackup = window.navigator.appVersion;
        Object.defineProperty(window.navigator, 'appVersion', {
          value: appVersionBackup,
          configurable: true,
          writable: true,
        });

        it('opens an sms link', async () => {
          await openSocialAndCheckWindow('sms', 'sms');
        });

        it('uses ? as separator by default', async () => {
          await openSocialAndCheckWindow('sms', '?');
        });

        it('uses ; as separator on iOS < 8', async () => {
          window.navigator.platform = 'iPhone';
          window.navigator.appVersion =
            '5.0 (iPhone; CPU iPhone OS 7_0_2 like Mac OS X)';

          await openSocialAndCheckWindow('sms', ';');

          window.navigator.platform = platformBackup;
          window.navigator.appVersion = appVersionBackup;
        });

        it('uses & as separator on iOS >= 8', async () => {
          window.navigator.platform = 'iPhone';
          window.navigator.appVersion =
            '5.0 (iPhone; CPU iPhone OS 12_3 like Mac OS X)';

          await openSocialAndCheckWindow('sms', '&');

          window.navigator.platform = platformBackup;
          window.navigator.appVersion = appVersionBackup;
        });
      });

      describe('yahoo', () => {
        it('opens a window with Yahoo! share screen', async () => {
          await openSocialAndCheckWindow('yahoo');
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

      it('it correctly sets the dialogTitle property if initialized with the dialog-title attribute', async () => {
        const dialogTitleShareMenu: ShareMenu = await fixture(html`
          <share-menu dialog-title="dialogTitle"></share-menu>
        `);

        expect(dialogTitleShareMenu.dialogTitle).to.equal('dialogTitle');
      });

      it('defaults to "Share" if dialog-title attribute is not passed', async () => {
        const noDialogTitleShareMenu: ShareMenu = await fixture(html`
          <share-menu></share-menu>
        `);

        expect(noDialogTitleShareMenu.dialogTitle).to.equal('Share');
      });
    });

    describe('text', () => {
      it('syncs text property with text attribute', () => {
        shareMenu.setAttribute('text', 'Test text');
        expect(shareMenu.text).to.equal('Test text');

        shareMenu.text = 'Another test text';
        expect(shareMenu.getAttribute('text')).to.equal('Another test text');
      });

      it('it correctly sets the text property if initialized with the text attribute', async () => {
        const descriptionShareMenu: ShareMenu = await fixture(html`
          <share-menu text="text"></share-menu>
        `);

        expect(descriptionShareMenu.text).to.equal('text');
      });

      it('defaults to an empty string if text attribute is not passed and meta description is not set', async () => {
        const noDescriptionShareMenu: ShareMenu = await fixture(html`
          <share-menu></share-menu>
        `);

        expect(noDescriptionShareMenu.text).to.equal('');
      });

      it('defaults to meta description if it is available and text attribute is not passed', async () => {
        const metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        metaDescription.content = 'text';
        document.head.appendChild(metaDescription);

        const noDescriptionShareMenu: ShareMenu = await fixture(html`
          <share-menu></share-menu>
        `);

        expect(noDescriptionShareMenu.text).to.equal('text');

        document.head.removeChild(metaDescription);
      });
    });

    describe('title', () => {
      it('syncs title property with title attribute', () => {
        shareMenu.setAttribute('title', 'Test title');
        expect(shareMenu.title).to.equal('Test title');

        shareMenu.title = 'Another test title';
        expect(shareMenu.getAttribute('title')).to.equal('Another test title');
      });

      it('it correctly sets the title property if initialized with the title attribute', async () => {
        const titleShareMenu: ShareMenu = await fixture(html`
          <share-menu title="title"></share-menu>
        `);

        expect(titleShareMenu.title).to.equal('title');
      });

      it('defaults to current window title if title attribute is not passed', async () => {
        const noTitleShareMenu: ShareMenu = await fixture(html`
          <share-menu></share-menu>
        `);

        expect(noTitleShareMenu.title).to.equal(document.title);
      });
    });

    describe('url', () => {
      it('syncs url property with url attribute', () => {
        shareMenu.setAttribute('url', 'Test url');
        expect(shareMenu.url).to.equal('Test url');

        shareMenu.url = 'Another test url';
        expect(shareMenu.getAttribute('url')).to.equal('Another test url');
      });

      it('it correctly sets the url property if initialized with the url attribute', async () => {
        const urlShareMenu: ShareMenu = await fixture(html`
          <share-menu url="url"></share-menu>
        `);

        expect(urlShareMenu.url).to.equal('url');
      });

      it('defaults to current URL if url attribute is not passed and canonical URL is not set', async () => {
        const noUrlShareMenu: ShareMenu = await fixture(html`
          <share-menu></share-menu>
        `);

        expect(noUrlShareMenu.url).to.equal(window.location.href);
      });

      it('defaults to canonical URL if it is available and url attribute is not passed', async () => {
        const canonicalUrl = document.createElement('link');
        canonicalUrl.rel = 'canonical';
        canonicalUrl.href = 'https://example.com/canonical';
        document.head.appendChild(canonicalUrl);

        const noUrlShareMenu: ShareMenu = await fixture(html`
          <share-menu></share-menu>
        `);

        expect(noUrlShareMenu.url).to.equal('https://example.com/canonical');

        document.head.removeChild(canonicalUrl);
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
      const [imageOnlySocialId] = Object.entries(
        shareMenu['_supportedSocials'],
      ).find(([, { imageOnly }]) => imageOnly);

      it('syncs isImage property with is-image attribute', () => {
        shareMenu.setAttribute('is-image', 'no');
        expect(shareMenu.isImage).to.equal('no');

        shareMenu.isImage = 'yes';
        expect(shareMenu.getAttribute('is-image')).to.equal('yes');
      });

      it("doesn't render image only socials if is-imsage is falsy", () => {
        shareMenu.isImage = 'no';
        expect(
          shareMenu.shadowRoot.querySelector<HTMLButtonElement>(
            `button.social#${imageOnlySocialId}`,
          ),
        ).to.be.null;
      });

      it('renders image only socials if is-imsage is truthy', () => {
        shareMenu.isImage = 'yes';
        expect(
          shareMenu.shadowRoot.querySelector<HTMLButtonElement>(
            `button.social#${imageOnlySocialId}`,
          ),
        ).not.to.be.null;
      });

      it("doesn't render image only socials if is-image is auto and the URL isn't an image", () =>
        new Promise(resolve => {
          shareMenu.isImage = 'auto';
          shareMenu.url = `data:,${encodeURIComponent('Not an image')}`;
          // We need to wait some time for the image to be loaded
          setTimeout(() => {
            expect(
              shareMenu.shadowRoot.querySelector<HTMLButtonElement>(
                `button.social#${imageOnlySocialId}`,
              ),
            ).to.be.null;
            resolve();
          }, 50);
        }));

      it('renders image only socials if is-image is auto and the URL is an image', () =>
        new Promise(resolve => {
          shareMenu.isImage = 'auto';
          shareMenu.url =
            'data:image/gif;base64,R0lGODdhAQABAIABAAAAAP///ywAAAAAAQABAAACAkQBADs';
          // We need to wait some time for the image to be loaded
          setTimeout(() => {
            expect(
              shareMenu.shadowRoot.querySelector<HTMLButtonElement>(
                `button.social#${imageOnlySocialId}`,
              ),
            ).not.to.be.null;
            resolve();
          }, 50);
        }));
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

    describe('handle', () => {
      it('syncs handle property with handle attribute', () => {
        shareMenu.setAttribute('handle', 'never');
        expect(shareMenu.handle).to.equal('never');

        shareMenu.handle = 'always';
        expect(shareMenu.getAttribute('handle')).to.equal('always');
      });
    });
  });

  describe('open window helper', async () => {
    const backupOpen = window.open;
    const shareMenu: ShareMenu = await fixture(html`
      <share-menu></share-menu>
    `);

    it('opens the given URL in a new window if replace param is falsy', () => {
      const urlToOpen = 'https://example.com';
      const fakeOpen = fake((url: string, target: string) => {
        expect(url).to.equal(urlToOpen);
        expect(target).to.equal('_blank');
      });
      window.open = fakeOpen;
      shareMenu['_openWindow'](urlToOpen, false);
      window.open = backupOpen;
    });

    it('opens the given URL in the same window if replace param is truthy', () => {
      const urlToOpen = 'https://example.com';
      const fakeOpen = fake((url: string, target: string) => {
        expect(url).to.equal(urlToOpen);
        expect(target).to.equal('_self');
      });
      window.open = fakeOpen;
      shareMenu['_openWindow'](urlToOpen, true);
      window.open = backupOpen;
    });
  });
});
