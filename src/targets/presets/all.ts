import '../facebook.js';
import '../messenger.js';
import '../whatsapp.js';
import '../weibo.js';
import '../telegram.js';
import '../snapchat.js';
import '../qzone.js';
import '../pinterest.js';
import '../x.js';
import '../reddit.js';
import '../linkedin.js';
import '../tumblr.js';
import '../douban.js';
import '../vk.js';
import '../ok.js';
import '../mastodon.js';
import '../blogger.js';
import '../livejournal.js';
import '../evernote.js';
import '../pocket.js';
import '../hacker-news.js';
import '../flipboard.js';
import '../instapaper.js';
import '../diaspora.js';
import '../xing.js';
import '../skype.js';
import '../line.js';
import '../bluesky.js';
import '../substack.js';
import '../kakaotalk.js';
import '../mix.js';
import '../gmail.js';
import '../yahoo.js';
import '../email.js';
import '../sms.js';
import '../google-translate.js';
import '../print.js';
import type { FacebookShareTarget } from '../facebook.js';
import type { MessengerShareTarget } from '../messenger.js';

export class AllShareTargetPreset extends HTMLElement {
  private _facebookRef: FacebookShareTarget;
  private _messengerRef?: MessengerShareTarget;

  /**
   * The Facebook App ID. Must be specified for the
   * Messenger share button to be displayed.
   *
   * @return {string | null}
   */
  public get facebookAppId(): string | null {
    return this.getAttribute('facebook-app-id');
  }

  public set facebookAppId(val: string | null | undefined) {
    this.setAttribute('facebook-app-id', val);
  }

  public static readonly observedAttributes = ['facebook-app-id'];

  /** @private */
  private connectedCallback() {
    const template = document.createElement('template');
    template.innerHTML = `<!-- html -->
      ${
        this.facebookAppId
          ? `<!-- html -->
            <share-target-facebook app-id=${this.facebookAppId}></share-target-facebook>
            <share-target-messenger app-id=${this.facebookAppId}></share-target-messenger>
          `
          : '<share-target-facebook></share-target-facebook>'
      }
      <share-target-whatsapp></share-target-whatsapp>
      <share-target-weibo></share-target-weibo>
      <share-target-telegram></share-target-telegram>
      <share-target-snapchat></share-target-snapchat>
      <share-target-qzone></share-target-qzone>
      <share-target-pinterest></share-target-pinterest>
      <share-target-x></share-target-x>
      <share-target-reddit></share-target-reddit>
      <share-target-linkedin></share-target-linkedin>
      <share-target-tumblr></share-target-tumblr>
      <share-target-douban></share-target-douban>
      <share-target-vk></share-target-vk>
      <share-target-ok></share-target-ok>
      <share-target-mastodon></share-target-mastodon>
      <share-target-blogger></share-target-blogger>
      <share-target-livejournal></share-target-livejournal>
      <share-target-evernote></share-target-evernote>
      <share-target-pocket></share-target-pocket>
      <share-target-hacker-news></share-target-hacker-news>
      <share-target-flipboard></share-target-flipboard>
      <share-target-instapaper></share-target-instapaper>
      <share-target-diaspora></share-target-diaspora>
      <share-target-xing></share-target-xing>
      <share-target-skype></share-target-skype>
      <share-target-line></share-target-line>
      <share-target-bluesky></share-target-bluesky>
      <share-target-substack></share-target-substack>
      <share-target-kakaotalk></share-target-kakaotalk>
      <share-target-mix></share-target-mix>
      <share-target-gmail></share-target-gmail>
      <share-target-yahoo></share-target-yahoo>
      <share-target-email></share-target-email>
      <share-target-sms></share-target-sms>
      <share-target-google-translate></share-target-google-translate>
      <share-target-print></share-target-print>
    `;

    this.appendChild(template.content.cloneNode(true));

    this._facebookRef = this.querySelector('share-target-facebook');
    this._messengerRef = this.querySelector('share-target-messenger');
  }

  /** @private */
  private attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string,
  ) {
    if (oldValue === newValue || !this._facebookRef) {
      return;
    }
    switch (name) {
      case 'facebook-app-id':
        if (newValue) {
          if (!this._messengerRef) {
            this._messengerRef = document.createElement(
              'share-target-messenger',
            );
            this._facebookRef.insertAdjacentElement(
              'afterend',
              this._messengerRef,
            );
          }
          this._facebookRef.setAttribute('app-id', newValue);
          this._messengerRef.setAttribute('app-id', newValue);
        } else {
          this._facebookRef.removeAttribute('app-id');
          this._messengerRef.remove();
          this._messengerRef = null;
        }
        break;
    }
    // Notify the parent share menu that something has changed
    this.parentElement.shadowRoot
      .querySelector('slot')
      .dispatchEvent(new Event('slotchange'));
  }
}

customElements.define('share-target-preset-all', AllShareTargetPreset);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-preset-all': AllShareTargetPreset;
  }
}
