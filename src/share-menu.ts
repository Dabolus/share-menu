interface ShadowRootWithAdoptedStylesheets extends ShadowRoot {
  adoptedStyleSheets: CSSStyleSheet[];
}

interface CSSStyleSheetWithReplace extends CSSStyleSheet {
  replace: (text: string) => Promise<CSSStyleSheet>;
  replaceSync: (text: string) => void;
}

export interface ShareMenuParams {
  text?: string;
  title?: string;
  url?: string;
}

export interface ShareTarget extends HTMLElement {
  displayName: string;
  hint?: string;
  readonly color: string;
  readonly icon: string;
  readonly share: (shareMenu: ShareMenu) => unknown;
}

const isShareTargetNode = (node: Node): boolean =>
  node.nodeType === Node.ELEMENT_NODE &&
  node.nodeName.startsWith('SHARE-TARGET-');

const isShareTarget = (node: Node): node is ShareTarget => {
  const shareTarget = node as ShareTarget;

  return (
    typeof shareTarget.displayName === 'string' &&
    typeof shareTarget.color === 'string' &&
    typeof shareTarget.icon === 'string' &&
    typeof shareTarget.share === 'function'
  );
};

/**
 * `share-menu` is a complete and simple to use share menu that uses
 * [Web Share API](https://developers.google.com/web/updates/2016/10/navigator-share) when possible,
 * with a fallback to a nice share menu that tries to emulate the experience of the native one.
 *
 * -----------------------------------------------------------------------------------------------------------------
 *
 * Here you can see the list of the supported socials, as well as the limitations that each one gives:
 *
 * - Blogger
 * - Copy to clipboard
 * - Douban
 * - Email
 * - Evernote - _URL only_
 * - Facebook - _URL only if not using a Facebook App with the `facebook-app-id` parameter_
 * - FlipBoard - _URL and title only_
 * - Instapaper
 * - Diaspora - _URL and title only_
 * - LINE - _URL only_
 * - LinkedIn
 * - LiveJournal
 * - Odnoklassniki (OK.ru)
 * - Pinterest - _Will only be visible if the URL is an image. Look for the `isImage` parameter on the API docs for more info_
 * - Pocket - _URL only_
 * - Print - _Only prints the page at the given URL_
 * - QZone
 * - Reddit - _Shares an URL if there is no text provided, otherwise a text with the URL appended at the end will be shared._
 * - Skype
 * - SMS
 * - Telegram
 * - Translate - _Only translates the page at the given URL_
 * - Tumblr
 * - Twitter
 * - VKontakte
 * - Weibo
 * - WhatsApp
 * - WordPress
 * - Xing - _URL only_
 * - Yahoo
 * - Gmail
 *
 *
 * -----------------------------------------------------------------------------------------------------------------
 *
 * Example usage:
 * ```html
 * <share-menu title="Ohai!" text="Hello, World!" url="https://www.example.com/"></share-menu>
 * ```
 *
 * -----------------------------------------------------------------------------------------------------------------
 *
 * _Browse the [API docs](https://www.webcomponents.org/element/Dabolus/share-menu) for a fully working example._
 *
 * @customElement
 * @demo demo/index.html
 */
export class ShareMenu extends HTMLElement {
  /**
   * Fired when the content is shared (i.e. when a social is clicked).
   * The event payload contains an `origin` field that will be equal
   * to `native` if the native share menu has been triggered, or to
   * `fallback` if the fallback share menu has been used instead.
   * If the fallback share menu is used, the event payload will also
   * have a `social` field, that contains the ID of the social chosen by the user.
   *
   * @event share
   */

  /**
   * Fired when the share menu closes (either because the user shared
   * some content or closed the share menu).
   * The event payload contains an `origin` field that will be equal
   * to `native` if the native share menu has been triggered, or to
   * `fallback` if the fallback share menu has been used instead.
   *
   * @event close
   */

  /**
   * Fired when there is an error while sharing.
   * The reason of the error can be found in the `message` field of
   * the event payload.
   *
   * @event error
   */

  /**
   * Whether the fallback dialog is currently opened or not.
   *
   * @return {boolean}
   */
  public get opened(): boolean {
    return this.hasAttribute('opened');
  }

  public set opened(val: boolean) {
    if (val) {
      this.setAttribute('opened', '');
    } else {
      this.removeAttribute('opened');
    }
  }

  /**
   * The title of the dialog displayed if the user browser does not support the Web Share API.
   * Defaults to "Share".
   *
   * @return {string}
   */
  public get dialogTitle(): string {
    return this.getAttribute('dialog-title');
  }

  public set dialogTitle(val: string) {
    this.setAttribute('dialog-title', val);
  }

  /**
   * The hint to show below the copy to clipboard button.
   * Defaults to "Copy".
   *
   * @return {string}
   */
  public get copyHint(): string {
    return this.getAttribute('copy-hint');
  }

  public set copyHint(val: string) {
    this.setAttribute('copy-hint', val);
  }

  /**
   * The body of the content you want to share.
   * Defaults to your description meta tag.
   *
   * @return {string}
   */
  public get text(): string {
    return this.getAttribute('text');
  }

  public set text(val: string) {
    this.setAttribute('text', val);
  }

  /**
   * The title of the content you want to share.
   * Defaults to your page title.
   *
   * @return {string}
   */
  public get title(): string {
    return this.getAttribute('title');
  }

  public set title(val: string) {
    this.setAttribute('title', val);
  }

  /**
   * The URL of the content you want to share.
   * Defaults to your canonical URL if available, otherwise to your page `window.location.href`.
   *
   * @return {string}
   */
  public get url(): string {
    return this.getAttribute('url');
  }

  public set url(val: string) {
    this.setAttribute('url', val);
  }

  /**
   * Set to true if you want to hide the fallback dialog backdrop.
   *
   * @return {boolean}
   */
  public get noBackdrop(): boolean {
    return this.hasAttribute('no-backdrop');
  }

  public set noBackdrop(val: boolean) {
    if (val) {
      this.setAttribute('no-backdrop', '');
    } else {
      this.removeAttribute('no-backdrop');
    }
  }

  /**
   * Whether to show the handle or not.
   * It can have three different values:
   *
   * - "auto" _(default)_ - only show the handle on touchscreen devices (i.e. when device pointer is coarse);
   * - "always" - always show the handle;
   * - "never" - never show the handle.
   *
   * @return {string}
   */
  public get handle(): string {
    return this.getAttribute('handle');
  }

  public set handle(val: string) {
    this.setAttribute('handle', val);
  }

  public static readonly observedAttributes = [
    'dialog-title',
    'copy-hint',
    'opened',
    'text',
    'title',
    'url',
    'no-backdrop',
    'handle',
  ];
  public static stylesheet?: CSSStyleSheetWithReplace;

  private static readonly _supportsAdoptingStyleSheets =
    'adoptedStyleSheets' in Document.prototype;
  private readonly _styles: string;
  private readonly _template: HTMLTemplateElement;
  private _previousFocus: HTMLElement;
  private _firstFocusableElRef: HTMLElement;
  private _lastFocusableElRef: HTMLElement;
  private _backdropRef: HTMLDivElement;
  private _dialogRef: HTMLDivElement;
  private _dialogTitleRef: HTMLHeadingElement;
  private _copyHintRef: HTMLDivElement;
  private _socialsContainerRef: HTMLDivElement;
  private _clipboardPreviewRef: HTMLParagraphElement;
  private _socials: ShareTarget[] = [];

  public constructor() {
    super();

    this._styles = `/* css */
      :host {
        font-family: 'Roboto', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        max-height: 100%;
        z-index: -1;
        will-change: z-index;
        transition: .3s z-index step-end;
        overflow-y: auto;
        display: none;
      }

      :host([opened]) {
        z-index: 9999;
        transition: .3s z-index step-start;
      }

      * {
        box-sizing: border-box;
      }

      #backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        background: var(--backdrop-color, #000);
        will-change: opacity;
        transition: .3s opacity cubic-bezier(.4, 0, 1, 1);
        cursor: pointer;
        z-index: -1;
      }

      :host([opened]) #backdrop {
        opacity: .6;
        transition: .3s opacity cubic-bezier(0, 0, .2, 1);
      }

      :host([no-backdrop]) #backdrop {
        display: none;
      }

      #dialog {
        margin: 100vh auto 0 auto;
        background: var(--background-color, #fff);
        width: 100%;
        max-width: 640px;
        will-change: transform;
        transform: translateY(100vh);
        transition: .3s transform cubic-bezier(.4, 0, 1, 1);
        border-radius: 16px 16px 0 0;
      }

      :host([opened]) #dialog {
        transform: translateY(0);
        transition: .3s transform cubic-bezier(0, 0, .2, 1);
      }

      #handle {
        padding: 18px 0 4px;
      }

      :host([handle='never']) #handle {
        display: none;
      }

      @media (pointer: fine) {
        :host([handle='auto']) #handle {
          display: none;
        }
      }

      #handle::after {
        content: '';
        display: block;
        width: 24px;
        height: 4px;
        border-radius: 2px;
        background: var(--handle-color, rgba(0, 0, 0, .6));
        margin: auto;
      }

      hr {
        margin: 0;
        border-style: solid;
        border-color: var(--divider-color, rgba(0, 0, 0, .12));
      }

      #title {
        color: var(--title-color, rgba(0, 0, 0, .6));
        font-weight: 500;
        font-size: 18px;
        margin: 0;
        padding: 18px;
        text-align: center;
      }

      #clipboard-container {
        display: grid;
        grid-template: 72px / 1fr 72px;
        align-items: center;
        padding: 24px 12px 24px 24px;
      }

      #clipboard-container > p {
        margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;  
        overflow: hidden;
      }

      #socials-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        padding: 12px;
      }

      .social {
        padding: 12px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        appearance: none;
        cursor: pointer;
        border: none;
        outline: none;
        background: transparent;
        will-change: transform;
        transition: .3s transform;
      }

      .social:hover {
        transform: scale(1.05);
      }

      .icon, .clipboard-icon {
        position: relative;
        border-radius: 50%;
      }

      .icon {
        width: 42px;
        height: 42px;
        padding: 12px;
        fill: #fff;
      }

      .clipboard-icon {
        width: 26px;
        height: 26px;
        padding: 2px;
        fill: var(--hint-color, rgba(0, 0, 0, .6));
      }

      .icon::before, .icon::after, .clipboard-icon::before, .clipboard-icon::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: var(--ripple-color, #fff);
        opacity: .3;
        will-change: transform;
        transition: .3s transform;
        transform: scale(0);
      }

      .icon::after, .clipboard-icon::after {
        opacity: .4;
      }

      .social:focus .icon::before,
      .social:active .icon::after,
      .social:focus .clipboard-icon::before,
      .social:active .clipboard-icon::after {
        transform: scale(1);
      }

      .label, .hint {
        width: 72px;
        font-weight: 400;
        text-align: center;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .label {
        padding-top: 10px;
        color: var(--labels-color, rgba(0, 0, 0, .87));
        font-size: 14px;
      }

      .hint {
        padding-top: 4px;
        color: var(--hint-color, rgba(0, 0, 0, .6));
        font-size: 12px;
      }

      slot {
        display: none;
      }
    `;

    this._template = document.createElement('template');
    this._template.innerHTML = `<!-- html -->
      ${
        ShareMenu._supportsAdoptingStyleSheets
          ? ''
          : `<style>${this._styles}</style>`
      }
      <div id="backdrop" part="backdrop" tabindex="-1"></div>
      <div id="dialog" part="dialog" role="dialog" aria-labelledby="title">
        <div id="handle"></div>
        <h2 id="title" part="title"></h2>
        <div id="clipboard-container">
          <p id="clipboard-preview"></p>
          <button class="social" id="clipboard">
            <div class="clipboard-icon">
              <svg viewBox="0 0 256 256">
                <path d="M180 233H41V70H17v164a23 23 0 0024 22h139zm36-24a23 23 0 0023-23V23v-1a23 23 0 00-24-22H87a23 23 0 00-23 23v163a23 23 0 0023 23h128zm-1-23H87V23h128z"/>
              </svg>
            </div>
            <div class="hint" id="copy-hint"></div>
          </button>
        </div>
        <hr>
        <div id="socials-container"></div>
      </div>
      <slot></slot>
    `;

    this.attachShadow({ mode: 'open' });
    if (ShareMenu._supportsAdoptingStyleSheets) {
      ShareMenu.stylesheet = new CSSStyleSheet() as CSSStyleSheetWithReplace;
      (this.shadowRoot as ShadowRootWithAdoptedStylesheets).adoptedStyleSheets =
        [ShareMenu.stylesheet];
    }
    this.shadowRoot.appendChild(this._template.content.cloneNode(true));
  }

  /**
   * Displays the share dialog with the `title`, `text`, and `url` provided as attributes/properties.
   * You can also override their values by passing them as a parameter to this method. This can be particularly
   * useful if you are creating the dialog directly from JavaScript.
   *
   * @param {{ text: string, title: string, url: string }=} props An object containing `text`, `title`, and `url`, that will override the element attributes/properties.
   * @return {Promise<void>} A promise that resolves when the user selects a social.
   */
  public share({
    text = this.text,
    title = this.title,
    url = this.url,
  }: ShareMenuParams = {}) {
    this.text = text;
    this.title = title;
    this.url = url;
    if (navigator.share) {
      return navigator
        .share({
          text: this.text,
          title: this.title,
          url: this.url,
        })
        .then(() => {
          this.opened = false;
          ['share', 'close'].forEach((event) =>
            this._emitEvent(event, { origin: 'native' }),
          );
        })
        .catch(({ name }) => {
          // Safari throws an AbortError if user changes its mind and decides
          // not to share anything using the native share menu.
          // In that case, we don't want to show our fallback share menu.
          if (name !== 'AbortError') {
            return this._showFallbackShare();
          }
          this._emitEvent('close', { origin: 'native' });
        });
    }
    return this._showFallbackShare();
  }

  /** @private */
  private connectedCallback() {
    if (
      ShareMenu._supportsAdoptingStyleSheets &&
      ShareMenu.stylesheet &&
      ShareMenu.stylesheet.cssRules.length === 0
    ) {
      ShareMenu.stylesheet.replace(this._styles);
    }
    if (this.text === null) {
      this.text =
        document.querySelector<HTMLMetaElement>('meta[name=description]')
          ?.content || '';
    }
    if (this.title === null) {
      this.title = document.title || '';
    }
    if (this.url === null) {
      this.url =
        document.querySelector<HTMLLinkElement>('link[rel=canonical]')?.href ||
        window.location.href;
    }
    if (!this.dialogTitle) {
      this.dialogTitle = 'Share';
    }
    if (!this.copyHint) {
      this.copyHint = 'Copy';
    }
    if (!this.handle) {
      this.handle = 'auto';
    }

    this._backdropRef =
      this.shadowRoot.querySelector<HTMLDivElement>('#backdrop');
    this._dialogRef = this.shadowRoot.querySelector<HTMLDivElement>('#dialog');
    this._dialogTitleRef =
      this.shadowRoot.querySelector<HTMLHeadingElement>('#title');
    this._dialogTitleRef.textContent = this.dialogTitle;
    this._socialsContainerRef =
      this.shadowRoot.querySelector<HTMLDivElement>('#socials-container');
    this._copyHintRef =
      this.shadowRoot.querySelector<HTMLDivElement>('#copy-hint');
    this._copyHintRef.textContent = this.copyHint;

    this._clipboardPreviewRef =
      this.shadowRoot.querySelector<HTMLParagraphElement>('#clipboard-preview');

    this._clipboardPreviewRef.innerHTML = `${this.title}<br>${this.text}<br>${this.url}`;

    if (navigator.clipboard) {
      const cliboardButtonRef =
        this.shadowRoot.querySelector<HTMLButtonElement>('#clipboard');

      cliboardButtonRef.addEventListener('click', () => {
        navigator.clipboard
          .writeText(`${this.title}\n\n${this.text}\n\n${this.url}`)
          .catch(() =>
            this._emitEvent('error', {
              message: 'Unable to copy to clipboard',
            }),
          );

        this._emitEvent('share', { social: 'clipboard', origin: 'fallback' });
        this._close();
      });

      this._firstFocusableElRef = cliboardButtonRef;
    } else {
      const clipboardContainerRef =
        this.shadowRoot.querySelector<HTMLDivElement>('#clipboard-container');

      clipboardContainerRef.parentNode.removeChild(clipboardContainerRef);
    }

    const slotRef = this.shadowRoot.querySelector<HTMLSlotElement>('slot');

    slotRef.addEventListener('slotchange', async () => {
      const shareTargets = slotRef
        .assignedNodes({
          flatten: true,
        })
        .filter(isShareTargetNode);

      await Promise.all(
        shareTargets.map((target) =>
          customElements.whenDefined(target.nodeName.toLowerCase()),
        ),
      );

      this._socials = shareTargets.filter(isShareTarget);
      this._renderSocials();
    });
  }

  /** @private */
  private attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string,
  ) {
    if (oldValue === newValue) {
      return;
    }
    switch (name) {
      case 'dialog-title':
        if (this._dialogTitleRef) {
          this._dialogTitleRef.textContent = newValue;
        }
        break;
      case 'copy-hint':
        if (this._copyHintRef) {
          this._copyHintRef.textContent = newValue;
        }
        break;
      case 'opened':
        if (newValue === null) {
          this._close();
        } else {
          this.share();
        }
        break;
      case 'text':
      case 'title':
      case 'url':
        if (this._clipboardPreviewRef) {
          this._clipboardPreviewRef.innerHTML = `${this.title}<br>${this.text}<br>${this.url}`;
        }
        break;
    }
  }

  /** @private */
  private _renderSocials() {
    if (!this._socialsContainerRef) {
      return;
    }
    this._socialsContainerRef.innerHTML = '';
    this._socials.forEach((shareTarget, index) => {
      const { nodeName, color, icon, displayName, hint } = shareTarget;

      const social = nodeName.slice(13).toLowerCase();
      const socialButton: HTMLButtonElement = document.createElement('button');
      socialButton.className = 'social';
      socialButton.id = social;
      socialButton.title = displayName;
      socialButton.setAttribute('part', 'social-button');
      socialButton.addEventListener('click', () => {
        shareTarget.share(this);
        this._emitEvent('share', { social, origin: 'fallback' });
        this._close();
      });

      const socialIcon: HTMLDivElement = document.createElement('div');
      socialIcon.className = 'icon';
      socialIcon.innerHTML = `<svg viewBox="0 0 256 256"><path d="${icon}"/></svg>`;
      socialIcon.style.background = `#${color}`;
      socialIcon.setAttribute('part', 'social-icon');
      socialButton.appendChild(socialIcon);

      const socialLabel: HTMLDivElement = document.createElement('div');
      socialLabel.className = 'label';
      socialLabel.textContent = displayName;
      socialLabel.setAttribute('part', 'social-label');
      socialButton.appendChild(socialLabel);

      if (hint) {
        const socialHint: HTMLDivElement = document.createElement('div');
        socialHint.className = 'hint';
        socialHint.textContent = hint;
        socialButton.appendChild(socialHint);
      }

      this._socialsContainerRef.appendChild(socialButton);

      if (!navigator.clipboard && index === 0) {
        this._firstFocusableElRef = socialButton;
      }

      if (index === this._socials.length - 1) {
        this._lastFocusableElRef = socialButton;
      }
    });
  }

  public openWindow(
    url: string,
    query?: Record<string, string | number | boolean | null | undefined>,
    replace?: boolean,
  ) {
    return window.open(
      query
        ? `${url}?${new URLSearchParams(
            Object.entries(query).reduce(
              (newQuery, [key, value]) => ({
                ...newQuery,
                ...(typeof value !== 'undefined' && { [key]: `${value}` }),
              }),
              {},
            ),
          ).toString()}`
        : url,
      replace ? '_self' : '_blank',
      `width=${screen.width / 2},height=${screen.height / 2},left=${
        screen.width / 4
      },top=${screen.height / 4},menubar=0,status=0,titlebar=0,toolbar=0`,
    );
  }

  /** @private */
  private _emitEvent(type: string, detail: unknown) {
    return this.dispatchEvent(
      new CustomEvent(type, {
        bubbles: true,
        composed: true,
        detail,
      }),
    );
  }

  /** @private */
  private _showFallbackShare() {
    return new Promise<void>((resolve) => {
      function shareListener(this: ShareMenu) {
        this.removeEventListener('share', shareListener);
        resolve();
      }

      this._previousFocus = document.activeElement as HTMLElement;
      this.style.display = 'block';
      this._firstFocusableElRef.focus();
      this.scrollTop = Math.max(
        window.innerHeight / 2,
        window.innerHeight - this._dialogRef.offsetHeight,
      );
      this.opened = true;
      this._backdropRef.addEventListener('click', this._close.bind(this));
      this.addEventListener('scroll', this._handleScroll.bind(this));
      this.addEventListener('keydown', this._handleKeyDown.bind(this));
      this.addEventListener('share', shareListener.bind(this));
    });
  }

  /** @private */
  private _close() {
    this._backdropRef.removeEventListener('click', this._close);
    this.removeEventListener('scroll', this._handleScroll);
    this.opened = false;
    this.scroll({
      behavior: 'smooth',
      top: 0,
    });
    if (this._previousFocus) {
      this._previousFocus.focus();
      this._previousFocus = null;
    }
    setTimeout(() => {
      this.style.display = 'none';
      this._emitEvent('close', { origin: 'fallback' });
    }, 300);
  }

  /** @private */
  private _handleScroll() {
    if (this.scrollTop < 80) {
      this._close();
    }
  }

  /** @private */
  private _handleKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case 'Escape':
        this._close();
        break;
      case 'Tab':
        if (this._socials.length < 2) {
          e.preventDefault();
          break;
        }
        const activeEl =
          this.shadowRoot.activeElement || document.activeElement;
        if (e.shiftKey && activeEl === this._firstFocusableElRef) {
          e.preventDefault();
          this._lastFocusableElRef.focus();
        } else if (!e.shiftKey && activeEl === this._lastFocusableElRef) {
          e.preventDefault();
          this._firstFocusableElRef.focus();
        }
        break;
    }
  }
}

window.customElements.define('share-menu', ShareMenu);

declare global {
  interface HTMLElementTagNameMap {
    'share-menu': ShareMenu;
  }
}
