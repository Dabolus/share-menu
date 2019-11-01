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

    describe('a11y', () => {
      it('generates an accessible markup', async () => {
        // For some reason we need to create a new share menu,
        // otherwise axe will complain about "no elements in frame context"
        const possiblyAccessibleShareMenu: ShareMenu = await fixture(html`
          <share-menu is-image="yes"></share-menu>
        `);

        await expect(possiblyAccessibleShareMenu).to.be.accessible();
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
        const result = await waitForCloseEventPromise;
        expect(result).to.equal(true);
      });

      it('closes when clicking on the backdrop', async () => {
        const waitForCloseEventPromise = new Promise(resolve => {
          shareMenu.addEventListener('close', () => resolve(true), {
            once: true,
          });
        });

        shareMenu.share();
        shareMenu.shadowRoot.querySelector<HTMLDivElement>('#backdrop').click();
        const result = await waitForCloseEventPromise;
        expect(result).to.equal(true);
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
        // TODO: write Pinterest specs
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
        // TODO: write print specs
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
        it('opens an sms link', async () => {
          await openSocialAndCheckWindow('sms', 'sms');
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
