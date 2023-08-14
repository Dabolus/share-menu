import { expect, fixture, html, chai } from '@open-wc/testing';
import chaiAsPromised from '@esm-bundle/chai-as-promised';
import { ShareMenu } from '../src/share-menu.js';
import { PrintShareTarget } from '../src/targets/print.js';
import { GoogleTranslateShareTarget } from '../src/targets/google-translate.js';
import { FacebookShareTarget } from '../src/targets/facebook.js';
import { MessengerShareTarget } from '../src/targets/messenger.js';
import { TelegramShareTarget } from '../src/targets/telegram.js';
import { WhatsAppShareTarget } from '../src/targets/whatsapp.js';
import { RedditShareTarget } from '../src/targets/reddit.js';
import { TwitterShareTarget } from '../src/targets/twitter.js';
import { LinkedInShareTarget } from '../src/targets/linkedin.js';
import { TumblrShareTarget } from '../src/targets/tumblr.js';
import { PinterestShareTarget } from '../src/targets/pinterest.js';
import { SnapchatShareTarget } from '../src/targets/snapchat.js';
import { MastodonShareTarget } from '../src/targets/mastodon.js';
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
import { KakaoTalkShareTarget } from '../src/targets/kakaotalk.js';
import { EmailShareTarget } from '../src/targets/email.js';
import { SMSShareTarget } from '../src/targets/sms.js';
import '../src/share-menu.js';
import '../src/targets/presets/all.js';

chai.use(chaiAsPromised);

describe('share menu presets', async () => {
  describe('all', () => {
    const allTargets = [
      PrintShareTarget,
      GoogleTranslateShareTarget,
      FacebookShareTarget,
      MessengerShareTarget,
      TelegramShareTarget,
      WhatsAppShareTarget,
      RedditShareTarget,
      TwitterShareTarget,
      LinkedInShareTarget,
      TumblrShareTarget,
      PinterestShareTarget,
      SnapchatShareTarget,
      MastodonShareTarget,
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
      KakaoTalkShareTarget,
      EmailShareTarget,
      SMSShareTarget,
    ];

    describe('without Facebook App ID', () => {
      it('adds all targets besides messenger', async () => {
        const shareMenu = await fixture<ShareMenu>(html`
          <share-menu url="https://www.example.com">
            <share-target-preset-all></share-target-preset-all>
          </share-menu>
        `);
        const targetsWithoutMessenger = allTargets.filter(
          (target) => target !== MessengerShareTarget,
        );
        expect(shareMenu.targets.length).to.equal(
          targetsWithoutMessenger.length,
        );
        shareMenu.targets.forEach((target, index) => {
          expect(target).to.be.instanceOf(targetsWithoutMessenger[index]);
        });
      });

      it('updates socials when Facebook App ID is removed', async () => {
        const facebookAppId = 'test';
        const shareMenu = await fixture<ShareMenu>(html`
          <share-menu url="https://www.example.com">
            <share-target-preset-all
              facebook-app-id="${facebookAppId}"
            ></share-target-preset-all>
          </share-menu>
        `);
        const allPreset = shareMenu.querySelector('share-target-preset-all');
        const facebookTarget = shareMenu.querySelector('share-target-facebook');
        expect(facebookTarget.appId).to.equal(facebookAppId);
        expect(
          shareMenu.querySelector('share-target-messenger').appId,
        ).to.equal(facebookAppId);
        allPreset.facebookAppId = '';
        expect(facebookTarget.appId).to.be.null;
        expect(shareMenu.querySelector('share-target-messenger')).to.be.null;
      });
    });

    describe('with Facebook App ID', () => {
      it('adds all targets', async () => {
        const shareMenu = await fixture<ShareMenu>(html`
          <share-menu url="https://www.example.com">
            <share-target-preset-all
              facebook-app-id="test"
            ></share-target-preset-all>
          </share-menu>
        `);
        expect(shareMenu.targets.length).to.equal(allTargets.length);
        shareMenu.targets.forEach((target, index) => {
          expect(target).to.be.instanceOf(allTargets[index]);
        });
      });

      it('proxies Facebook App ID to socials that need it', async () => {
        const facebookAppId = 'test';
        const shareMenu = await fixture<ShareMenu>(html`
          <share-menu url="https://www.example.com">
            <share-target-preset-all
              facebook-app-id="${facebookAppId}"
            ></share-target-preset-all>
          </share-menu>
        `);
        const facebookTarget = shareMenu.querySelector('share-target-facebook');
        const messengerTarget = shareMenu.querySelector(
          'share-target-messenger',
        );
        expect(facebookTarget.appId).to.equal(facebookAppId);
        expect(messengerTarget.appId).to.equal(facebookAppId);
      });

      it('updates socials when Facebook App ID is added', async () => {
        const facebookAppId = 'test';
        const shareMenu = await fixture<ShareMenu>(html`
          <share-menu url="https://www.example.com">
            <share-target-preset-all></share-target-preset-all>
          </share-menu>
        `);
        const allPreset = shareMenu.querySelector('share-target-preset-all');
        const facebookTarget = shareMenu.querySelector('share-target-facebook');
        expect(facebookTarget.appId).to.be.null;
        expect(shareMenu.querySelector('share-target-messenger')).to.be.null;
        allPreset.facebookAppId = facebookAppId;
        expect(facebookTarget.appId).to.equal(facebookAppId);
        expect(
          shareMenu.querySelector('share-target-messenger').appId,
        ).to.equal(facebookAppId);
      });
    });
  });
});
