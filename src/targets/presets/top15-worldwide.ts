import '../facebook.js';
import '../messenger.js';
import '../whatsapp.js';
import '../weibo.js';
import '../telegram.js';
import '../snapchat.js';
import '../qzone.js';
import '../pinterest.js';
import '../twitter.js';
import '../reddit.js';
import '../linkedin.js';
import '../tumblr.js';
import '../douban.js';
import '../vk.js';
import '../ok.js';
import type { FacebookShareTarget } from '../facebook.js';
import type { MessengerShareTarget } from '../messenger.js';

export class Top15WorldwideShareTargetPreset extends HTMLElement {
  private _facebookRef: FacebookShareTarget;
  private _messengerRef?: MessengerShareTarget;

  /**
   * The Facebook App ID. Must be specified for the
   * Messenger share button to be displayed
   *
   * @return {string}
   */
  public get facebookAppId(): string {
    return this.getAttribute('facebook-app-id');
  }

  public set facebookAppId(val: string) {
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
      <share-target-twitter></share-target-twitter>
      <share-target-reddit></share-target-reddit>
      <share-target-linkedin></share-target-linkedin>
      <share-target-tumblr></share-target-tumblr>
      <share-target-douban></share-target-douban>
      <share-target-vk></share-target-vk>
      <share-target-ok></share-target-ok>
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

customElements.define(
  'share-target-preset-top15-worldwide',
  Top15WorldwideShareTargetPreset,
);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-preset-top15-worldwide': Top15WorldwideShareTargetPreset;
  }
}
