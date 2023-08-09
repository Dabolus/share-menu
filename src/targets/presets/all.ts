import '../print.js';
import '../google-translate.js';
import '../facebook.js';
import '../telegram.js';
import '../whatsapp.js';
import '../reddit.js';
import '../twitter.js';
import '../messenger.js';
import '../linkedin.js';
import '../tumblr.js';
import '../pinterest.js';
import '../mastodon.js';
import '../blogger.js';
import '../livejournal.js';
import '../evernote.js';
import '../pocket.js';
import '../hacker-news.js';
import '../flipboard.js';
import '../instapaper.js';
import '../diaspora.js';
import '../qzone.js';
import '../weibo.js';
import '../vk.js';
import '../ok.js';
import '../douban.js';
import '../xing.js';
import '../skype.js';
import '../line.js';
import '../gmail.js';
import '../yahoo.js';
import '../substack.js';
import '../email.js';
import '../sms.js';

export class AllShareTargetPreset extends HTMLElement {
  public constructor() {
    super();

    const template = document.createElement('template');
    template.innerHTML = `<!-- html -->
      <share-target-print></share-target-print>
      <share-target-google-translate></share-target-google-translate>
      <share-target-facebook></share-target-facebook>
      <share-target-telegram></share-target-telegram>
      <share-target-whatsapp></share-target-whatsapp>
      <share-target-reddit></share-target-reddit>
      <share-target-twitter></share-target-twitter>
      <share-target-messenger></share-target-messenger>
      <share-target-linkedin></share-target-linkedin>
      <share-target-tumblr></share-target-tumblr>
      <share-target-pinterest></share-target-pinterest>
      <share-target-mastodon></share-target-mastodon>
      <share-target-blogger></share-target-blogger>
      <share-target-livejournal></share-target-livejournal>
      <share-target-evernote></share-target-evernote>
      <share-target-pocket></share-target-pocket>
      <share-target-hacker-news></share-target-hacker-news>
      <share-target-flipboard></share-target-flipboard>
      <share-target-instapaper></share-target-instapaper>
      <share-target-diaspora></share-target-diaspora>
      <share-target-qzone></share-target-qzone>
      <share-target-weibo></share-target-weibo>
      <share-target-vk></share-target-vk>
      <share-target-ok></share-target-ok>
      <share-target-douban></share-target-douban>
      <share-target-xing></share-target-xing>
      <share-target-skype></share-target-skype>
      <share-target-line></share-target-line>
      <share-target-gmail></share-target-gmail>
      <share-target-yahoo></share-target-yahoo>
      <share-target-substack></share-target-substack>
      <share-target-email></share-target-email>
      <share-target-sms></share-target-sms>
    `;

    this.appendChild(template.content.cloneNode(true));
  }
}

window.customElements.define('share-target-preset-all', AllShareTargetPreset);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-preset-all': AllShareTargetPreset;
  }
}
