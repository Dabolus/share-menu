import { html, fixture, expect } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import { fake } from 'sinon';
import {
  ShareMenu,
  ShareMenuShareEvent,
  ShareMenuShareEventPayload,
} from '../src/share-menu.js';
import { PrintShareTarget } from '../src/targets/print.js';
import { GoogleTranslateShareTarget } from '../src/targets/google-translate.js';
import { FacebookShareTarget } from '../src/targets/facebook.js';
import { TelegramShareTarget } from '../src/targets/telegram.js';
import { WhatsAppShareTarget } from '../src/targets/whatsapp.js';
import { RedditShareTarget } from '../src/targets/reddit.js';
import { TwitterShareTarget } from '../src/targets/twitter.js';
import { LinkedInShareTarget } from '../src/targets/linkedin.js';
import { TumblrShareTarget } from '../src/targets/tumblr.js';
import { PinterestShareTarget } from '../src/targets/pinterest.js';
import { BloggerShareTarget } from '../src/targets/blogger.js';
import { LiveJournalShareTarget } from '../src/targets/livejournal.js';
import { EverNoteShareTarget } from '../src/targets/evernote.js';
import { PocketShareTarget } from '../src/targets/pocket.js';
import { HackerNewsShareTarget } from '../src/targets/hacker-news.js';
import { FlipboardShareTarget } from '../src/targets/flipboard.js';
import { InstapaperShareTarget } from '../src/targets/instapaper.js';
import { DiasporaShareTarget } from '../src/targets/diaspora.js';
import { QZoneShareTarget } from '../src/targets/qzone.js';
import { WeiboShareTarget } from '../src/targets/weibo.js';
import { VKShareTarget } from '../src/targets/vk.js';
import { OKShareTarget } from '../src/targets/ok.js';
import { DoubanShareTarget } from '../src/targets/douban.js';
import { XINGShareTarget } from '../src/targets/xing.js';
import { SkypeShareTarget } from '../src/targets/skype.js';
import { LINEShareTarget } from '../src/targets/line.js';
import { GmailShareTarget } from '../src/targets/gmail.js';
import { YahooShareTarget } from '../src/targets/yahoo.js';
import { SubstackShareTarget } from '../src/targets/substack.js';
import { EmailShareTarget } from '../src/targets/email.js';
import { SMSShareTarget } from '../src/targets/sms.js';
import '../src/share-menu.js';
import '../src/targets/presets/all.js';

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
  FB?: FB;
}

declare const window: CustomWindow;

describe('share menu', () => {
  describe('native share via Web Share API', async () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const fakeShare = fake(async () => {});
    const shareMenu = await fixture<ShareMenu>(
      html`<share-menu url="https://www.example.com">></share-menu>`,
    );

    it('uses the Web Share API', async () => {
      window.navigator.share = fakeShare;

      await expect(() => shareMenu.share()).not.to.throw();
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
    const createShareMenu = async () => {
      const shareMenu = await fixture<ShareMenu>(html`
        <share-menu url="https://www.example.com">
          <share-target-preset-all></share-target-preset-all>
        </share-menu>
      `);
      shareMenu.shadowRoot
        ?.querySelector('slot')
        ?.dispatchEvent(new Event('slotchange'));
      return shareMenu;
    };

    const createTargetOpener =
      (shareMenu: ShareMenu) =>
      (target?: string): Promise<ShareMenuShareEventPayload> =>
        new Promise((resolve) => {
          shareMenu.addEventListener('share', ({ detail }) => resolve(detail), {
            once: true,
          });
          shareMenu.share();
          shareMenu.shadowRoot
            ?.querySelector<HTMLButtonElement>(
              `button.target${target ? `#${target}` : ''}`,
            )
            ?.click();
        });

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
        shareMenu.share();

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

    describe('targets', async () => {
      const shareMenu = await createShareMenu();
      const openTarget = createTargetOpener(shareMenu);

      const openTargetAndCheckWindow = async (
        target: string,
        match = target,
      ) => {
        const openWindowBackup = shareMenu.openWindow;
        const fakeOpenWindow = fake((url: string) => {
          expect(url).to.contain(match);
          return window;
        });
        shareMenu.openWindow = fakeOpenWindow;

        await openTarget(target);
        expect(fakeOpenWindow.calledOnce).to.equal(true);

        shareMenu.openWindow = openWindowBackup;
      };

      it('creates a button for the specified targets and in the specified order', () => {
        const socials = [
          PrintShareTarget,
          GoogleTranslateShareTarget,
          FacebookShareTarget,
          TelegramShareTarget,
          WhatsAppShareTarget,
          RedditShareTarget,
          TwitterShareTarget,
          LinkedInShareTarget,
          TumblrShareTarget,
          PinterestShareTarget,
          BloggerShareTarget,
          LiveJournalShareTarget,
          EverNoteShareTarget,
          PocketShareTarget,
          HackerNewsShareTarget,
          FlipboardShareTarget,
          InstapaperShareTarget,
          DiasporaShareTarget,
          QZoneShareTarget,
          WeiboShareTarget,
          VKShareTarget,
          OKShareTarget,
          DoubanShareTarget,
          XINGShareTarget,
          SkypeShareTarget,
          LINEShareTarget,
          GmailShareTarget,
          YahooShareTarget,
          SubstackShareTarget,
          EmailShareTarget,
          SMSShareTarget,
        ];
        expect(shareMenu.targets.length).to.equal(socials.length);
        shareMenu.targets.forEach((target, index) => {
          expect(target).to.be.instanceOf(socials[index]);
        });
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

          await openTarget('clipboard');
          expect(fakeClipboardWriteText.calledOnce).to.equal(true);

          // @ts-ignore We need to restore the original clipboard
          window.navigator.clipboard = clipboardBackup;
        });

        it('emits an error event if writing to clipboard fails', async () => {
          const fakeClipboardWriteText = fake.rejects(new Error());
          window.navigator.clipboard.writeText = fakeClipboardWriteText;

          shareMenu.addEventListener(
            'error',
            (event) => {
              expect(event).to.be.instanceOf(ErrorEvent);
              expect(event.message).to.equal('Unable to copy to clipboard');
            },
            { once: true },
          );
          const sharePromise = shareMenu.share();
          shareMenu.shadowRoot
            ?.querySelector<HTMLButtonElement>('button.target#clipboard')
            ?.click();
          await sharePromise;

          // @ts-ignore We need to restore the original clipboard
          window.navigator.clipboard = clipboardBackup;
        });

        it('emits an error event if navigator.clipboard is not supported', async () => {
          // @ts-ignore We need to simulate the clipboard not being supported
          window.navigator.clipboard = undefined;

          shareMenu.addEventListener(
            'error',
            (event) => {
              expect(event).to.be.instanceOf(ErrorEvent);
              expect(event.message).to.equal('Unable to copy to clipboard');
            },
            { once: true },
          );
          const sharePromise = shareMenu.share();
          shareMenu.shadowRoot
            ?.querySelector<HTMLButtonElement>('button.target#clipboard')
            ?.click();
          await sharePromise;

          // @ts-ignore We need to restore the original clipboard
          window.navigator.clipboard = clipboardBackup;
        });
      });

      describe('facebook', () => {
        it('uses Facebook JS API if available', async () => {
          const fakeFBUI = fake();
          window.FB = {
            ui: fakeFBUI,
          };

          await openTarget('facebook');
          expect(fakeFBUI.calledOnce).to.equal(true);

          delete window.FB;
        });

        it('opens a window with Facebook share screen if Facebook JS API is not available', async () => {
          await openTargetAndCheckWindow('facebook');
        });
      });

      describe('twitter', () => {
        it('opens a window with Twitter share screen', async () => {
          await openTargetAndCheckWindow('twitter');
        });

        xit('adds the via parameter if via is set', async () => {
          const twitterShareTarget = shareMenu.querySelector(
            'share-target-twitter',
          )!;
          const viaBackup = twitterShareTarget.via;
          twitterShareTarget.via = 'via';
          await openTargetAndCheckWindow('twitter', 'via=');
          twitterShareTarget.via = viaBackup;
        });

        xit("doesn't add the via parameter if via isn't set", async () => {
          const twitterShareTarget = shareMenu.querySelector(
            'share-target-twitter',
          )!;
          const viaBackup = twitterShareTarget.via;
          twitterShareTarget.via = '';
          const openWindowBackup = shareMenu.openWindow;
          const fakeOpenWindow = fake((url: string) => {
            expect(url).not.to.contain('via=');
            return null;
          });
          shareMenu.openWindow = fakeOpenWindow;
          await openTarget('twitter');
          expect(fakeOpenWindow.calledOnce).to.equal(true);
          shareMenu.openWindow = openWindowBackup;

          twitterShareTarget.via = viaBackup;
        });
      });

      describe('whatsapp', () => {
        it('opens a window with WhatsApp share screen', async () => {
          await openTargetAndCheckWindow('whatsapp');
        });
      });

      describe('telegram', () => {
        it('opens a window with Telegram share screen', async () => {
          await openTargetAndCheckWindow('telegram', 't.me');
        });
      });

      describe('linkedin', () => {
        it('opens a window with LinkedIn share screen', async () => {
          await openTargetAndCheckWindow('linkedin');
        });
      });

      describe('pinterest', () => {
        it('opens a window with Pinterest share screen', async () => {
          await openTargetAndCheckWindow('pinterest');
        });
      });

      describe('tumblr', () => {
        it('opens a window with Tumblr share screen', async () => {
          await openTargetAndCheckWindow('tumblr');
        });
      });

      describe('reddit', () => {
        it('opens a window with Reddit share screen', async () => {
          await openTargetAndCheckWindow('reddit');
        });

        xit('shares an URL if share menu has no text', async () => {
          const textBackup = shareMenu.text;
          shareMenu.text = '';
          await openTargetAndCheckWindow('reddit', 'url=');
          shareMenu.text = textBackup;
        });

        xit('shares a text if share menu has text', async () => {
          const textBackup = shareMenu.text;
          shareMenu.text = 'A text';
          await openTargetAndCheckWindow('reddit', 'text=');
          shareMenu.text = textBackup;
        });
      });

      describe('vk', () => {
        it('opens a window with VK share screen', async () => {
          await openTargetAndCheckWindow('vk');
        });
      });

      describe('skype', () => {
        it('opens a window with Skype share screen', async () => {
          await openTargetAndCheckWindow('skype');
        });
      });

      describe('line', () => {
        it('opens a window with Line share screen', async () => {
          await openTargetAndCheckWindow('line');
        });
      });

      describe('qzone', () => {
        it('opens a window with Qzone share screen', async () => {
          await openTargetAndCheckWindow('qzone');
        });
      });

      describe('blogger', () => {
        it('opens a window with Blogger share screen', async () => {
          await openTargetAndCheckWindow('blogger');
        });
      });

      describe('diaspora', () => {
        it('opens a window with Diaspora share screen', async () => {
          await openTargetAndCheckWindow('diaspora');
        });
      });

      describe('flipboard', () => {
        it('opens a window with Flipboard share screen', async () => {
          await openTargetAndCheckWindow('flipboard');
        });
      });

      describe('evernote', () => {
        it('opens a window with Evernote share screen', async () => {
          await openTargetAndCheckWindow('evernote');
        });
      });

      describe('pocket', () => {
        it('opens a window with Pocket share screen', async () => {
          await openTargetAndCheckWindow('pocket');
        });
      });

      describe('livejournal', () => {
        it('opens a window with LiveJournal share screen', async () => {
          await openTargetAndCheckWindow('livejournal');
        });
      });

      describe('gmail', () => {
        it('opens a window with Gmail share screen', async () => {
          await openTargetAndCheckWindow('gmail', 'mail.google.com');
        });
      });

      describe('hacker-news', () => {
        it('opens a window with Hacker News share screen', async () => {
          await openTargetAndCheckWindow('hacker-news', 'news.ycombinator.com');
        });
      });

      describe('instapaper', () => {
        it('opens a window with Instapaper share screen', async () => {
          await openTargetAndCheckWindow('instapaper');
        });
      });

      describe('ok', () => {
        it('opens a window with OK.ru share screen', async () => {
          await openTargetAndCheckWindow('ok', 'ok.ru');
        });
      });

      describe('xing', () => {
        it('opens a window with XING share screen', async () => {
          await openTargetAndCheckWindow('xing');
        });
      });

      describe('douban', () => {
        it('opens a window with Douban share screen', async () => {
          await openTargetAndCheckWindow('douban');
        });
      });

      describe('weibo', () => {
        it('opens a window with Weibo share screen', async () => {
          await openTargetAndCheckWindow('weibo');
        });
      });

      describe('print', () => {
        it('opens a new window at the given URL and prints it', async () => {
          const openWindowBackup = shareMenu.openWindow;
          const fakePrint = fake();
          const fakeOpenWindow = () =>
            ({
              print: fakePrint,
            }) as unknown as Window;
          shareMenu.openWindow = fakeOpenWindow;

          await openTarget('print');
          expect(fakePrint).to.have.been.calledOnce;

          shareMenu.openWindow = openWindowBackup;
        });
      });

      describe('translate', () => {
        it('opens a window with Google Translator translation page', async () => {
          await openTargetAndCheckWindow(
            'google-translate',
            'translate.google.com',
          );
        });
      });

      describe('email', () => {
        it('opens a mailto link', async () => {
          await openTargetAndCheckWindow('email', 'mailto');
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
          await openTargetAndCheckWindow('sms', 'sms');
        });

        it('uses ? as separator by default', async () => {
          await openTargetAndCheckWindow('sms', '?');
        });

        it('uses ; as separator on iOS < 8', async () => {
          // @ts-ignore These properties are deprecated, but we need to use them to simulate an old iOS version
          window.navigator.platform = 'iPhone';
          // @ts-ignore
          window.navigator.appVersion =
            '5.0 (iPhone; CPU iPhone OS 7_0_2 like Mac OS X)';

          await openTargetAndCheckWindow('sms', ';');

          // @ts-ignore We also need to restore them to their original value
          window.navigator.platform = platformBackup;
          // @ts-ignore
          window.navigator.appVersion = appVersionBackup;
        });

        it('uses & as separator on iOS >= 8', async () => {
          // @ts-ignore These properties are deprecated, but we need to use them to simulate an old iOS version
          window.navigator.platform = 'iPhone';
          // @ts-ignore
          window.navigator.appVersion =
            '5.0 (iPhone; CPU iPhone OS 12_3 like Mac OS X)';

          await openTargetAndCheckWindow('sms', '&');

          // @ts-ignore We also need to restore them to their original value
          window.navigator.platform = platformBackup;
          // @ts-ignore
          window.navigator.appVersion = appVersionBackup;
        });
      });

      describe('yahoo', () => {
        it('opens a window with Yahoo! share screen', async () => {
          await openTargetAndCheckWindow('yahoo');
        });
      });

      describe('substack', () => {
        it('opens a window with Substack share screen', async () => {
          await openTargetAndCheckWindow('substack');
        });
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
      const fakeOpen = fake((url: string, target: string) => {
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
      const fakeOpen = fake((url: string, target: string) => {
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
