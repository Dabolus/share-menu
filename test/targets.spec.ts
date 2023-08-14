import { expect, fixture, html, chai } from '@open-wc/testing';
import { fake } from 'sinon';
import chaiAsPromised from '@esm-bundle/chai-as-promised';
import { createShareMenu, createTargetOpener } from './helpers.js';
import { ShareMenu } from '../src/share-menu.js';
import { PrintShareTarget } from '../src/targets/print.js';
import { GoogleTranslateShareTarget } from '../src/targets/google-translate.js';
import { FacebookShareTarget } from '../src/targets/facebook.js';
import { MessengerShareTarget } from '../src/targets/messenger.js';
import { TelegramShareTarget } from '../src/targets/telegram.js';
import '../src/share-menu.js';
import '../src/targets/presets/all.js';

chai.use(chaiAsPromised);

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

describe('share menu targets', async () => {
  const shareMenu = await createShareMenu();
  const openTarget = createTargetOpener(shareMenu);

  const openTargetAndCheckWindow = async (target: string, match = target) => {
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

  it('creates a button for the specified targets and in the specified order', async () => {
    const shareMenuWithCustomTargets = await fixture<ShareMenu>(html`
      <share-menu url="https://www.example.com">
        <share-target-print></share-target-print>
        <share-target-google-translate></share-target-google-translate>
        <share-target-facebook></share-target-facebook>
        <share-target-messenger></share-target-messenger>
        <share-target-telegram></share-target-telegram>
      </share-menu>
    `);
    const targets = [
      PrintShareTarget,
      GoogleTranslateShareTarget,
      FacebookShareTarget,
      MessengerShareTarget,
      TelegramShareTarget,
    ];
    expect(shareMenuWithCustomTargets.targets.length).to.equal(targets.length);
    shareMenuWithCustomTargets.targets.forEach((target, index) => {
      expect(target).to.be.instanceOf(targets[index]);
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
      const fakeClipboardWrite = fake.resolves(undefined);
      window.navigator.clipboard.write = fakeClipboardWrite;

      await openTarget('clipboard');
      expect(fakeClipboardWrite.calledOnce).to.equal(true);

      // @ts-ignore We need to restore the original clipboard
      window.navigator.clipboard = clipboardBackup;
    });

    it('emits an error event if writing to clipboard fails', async () => {
      const fakeClipboardWrite = fake.rejects(new Error());
      window.navigator.clipboard.write = fakeClipboardWrite;

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
      await expect(sharePromise).to.be.rejected;

      // @ts-ignore We need to restore the original clipboard
      window.navigator.clipboard = clipboardBackup;
    });

    it('hides the copy to clipboard button if clipboard is not supported', async () => {
      // @ts-ignore We need to simulate the clipboard not being supported
      window.navigator.clipboard = undefined;

      const shareMenuWithoutClipboard = await fixture<ShareMenu>(
        html`<share-menu url="https://www.example.com"></share-menu>`,
      );
      shareMenuWithoutClipboard.addEventListener(
        'error',
        (event) => {
          expect(event).to.be.instanceOf(ErrorEvent);
          expect(event.message).to.equal('Unable to copy to clipboard');
        },
        { once: true },
      );
      shareMenuWithoutClipboard.share();
      expect(
        shareMenuWithoutClipboard.shadowRoot?.querySelector<HTMLButtonElement>(
          'button.target#clipboard',
        ),
      ).to.equal(null);

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

    it('uses dialog/share API if a Facebook App ID is provided', async () => {
      const facebookShareTarget = shareMenu.querySelector(
        'share-target-facebook',
      )!;
      const appIdBackup = facebookShareTarget.appId;
      facebookShareTarget.appId = 'test';
      await openTargetAndCheckWindow('facebook', 'facebook.com/dialog/share');
      facebookShareTarget.appId = appIdBackup;
    });

    it('opens a window with Facebook share screen if Facebook JS API is not available', async () => {
      await openTargetAndCheckWindow('facebook');
    });
  });

  describe('messenger', () => {
    it('opens a window with Messenger share screen', async () => {
      await openTargetAndCheckWindow('messenger', 'facebook.com/dialog/send');
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

  describe('snapchat', () => {
    it('opens a window with Snapchat share screen', async () => {
      await openTargetAndCheckWindow('snapchat');
    });
  });

  describe('mastodon', () => {
    it('opens a window with Mastodon share screen (through toot)', async () => {
      await openTargetAndCheckWindow('mastodon', 'toot');
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

  describe('kakaotalk', () => {
    it('opens a window with KakaoTalk share screen', async () => {
      await openTargetAndCheckWindow('kakaotalk', 'kakao');
    });
  });

  describe('mix', () => {
    it('opens a window with Mix share screen', async () => {
      await openTargetAndCheckWindow('mix');
    });
  });
});
