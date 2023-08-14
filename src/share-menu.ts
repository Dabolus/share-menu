export interface ShareMenuParams {
  text?: string;
  title?: string;
  url?: string;
  image?: string;
}

export interface ShareTarget extends HTMLElement {
  readonly displayName: string;
  readonly hint?: string;
  readonly color: string;
  readonly outline?: string;
  readonly icon: string;
  readonly share: (shareMenu: ShareMenu) => unknown;
}

const isShareTargetNode = (node: Node): node is ShareTarget =>
  node.nodeType === Node.ELEMENT_NODE &&
  node.nodeName.startsWith('SHARE-TARGET-') &&
  !node.nodeName.startsWith('SHARE-TARGET-PRESET-');

const isShareTargetPreset = (node: Node): boolean =>
  node.nodeType === Node.ELEMENT_NODE &&
  node.nodeName.startsWith('SHARE-TARGET-PRESET-');

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
 * Here you can see the list of the supported targets, as well as the limitations that each one gives:
 *
 * - Copy to clipboard
 * - Blogger
 * - Diaspora - _URL and title only_
 * - Douban
 * - Email
 * - Evernote - _URL and title only_
 * - Facebook - _URL only if not using [Facebook JS SDK](https://developers.facebook.com/docs/javascript) or not providing a Facebook App ID_
 * - Flipboard - _URL and title only_
 * - Gmail
 * - Google Translate - _Only translates the page at the given URL_
 * - Hacker News - _URL and title only_
 * - Instapaper
 * - LINE - _URL only_
 * - LinkedIn - _URL only_
 * - LiveJournal
 * - Mastodon
 * - Messenger - _URL only, requires a Facebook App ID_
 * - Mix - _URL only_
 * - Odnoklassniki (OK.ru)
 * - Pinterest
 * - Pocket - _URL only_
 * - Print - _Only prints the page at the given URL_
 * - QZone
 * - Reddit - _Shares an URL if there is no text provided, otherwise a text with the URL appended at the end_
 * - Skype
 * - SMS
 * - Snapchat - _URL only_
 * - Substack Notes
 * - KakaoTalk - _URL only_
 * - Telegram
 * - Tumblr
 * - Twitter
 * - VKontakte (VK)
 * - Weibo
 * - WhatsApp
 * - XING - _URL only_
 * - Yahoo Mail
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
   * Fired when the content is shared (i.e. when a target is clicked).
   * The event payload contains an `origin` field that will be equal
   * to `native` if the native share menu has been triggered, or to
   * `fallback` if the fallback share menu has been used instead.
   * If the fallback share menu is used, the event payload will also
   * have a `target` field, that contains the ID of the share target
   * chosen by the user.
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
   * The URL of the image you want to share.
   *
   * @return {string}
   */
  public get image(): string {
    return this.getAttribute('image');
  }

  public set image(val: string) {
    this.setAttribute('image', val);
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

  /**
   * The list of share targets displayed in the fallback dialog.
   */
  public get targets() {
    return this._targets;
  }

  public static readonly observedAttributes = [
    'dialog-title',
    'copy-hint',
    'opened',
    'text',
    'title',
    'url',
    'image',
    'no-backdrop',
    'handle',
  ];
  public static stylesheet?: CSSStyleSheet;

  private static readonly _supportsAdoptingStyleSheets =
    typeof globalThis.CSSStyleSheet?.prototype.replace === 'function';
  private readonly _styles: string;
  private readonly _template: HTMLTemplateElement;
  private _previousFocus: HTMLElement;
  private _firstFocusableElRef: HTMLElement;
  private _lastFocusableElRef: HTMLElement;
  private _backdropRef: HTMLDivElement;
  private _dialogRef: HTMLDivElement;
  private _dialogTitleRef: HTMLHeadingElement;
  private _copyHintRef: HTMLDivElement;
  private _targetsContainerRef: HTMLDivElement;
  private _clipboardImagePreviewRef: HTMLImageElement;
  private _clipboardPreviewRef: HTMLPreElement;
  private _targets: ShareTarget[] = [];
  private _filePromise: Promise<File> = Promise.resolve<File>(undefined);

  public constructor() {
    super();

    this._styles = `/* css */
      :host {
        font-family: 'Google Sans', 'Roboto', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
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
        background: var(--sm-backdrop-color, #000);
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
        background: var(--sm-background-color, #fff);
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
        background: var(--sm-handle-color, rgba(0, 0, 0, .6));
        margin: auto;
      }

      hr {
        margin: 0;
        border: 1px solid var(--sm-divider-color, rgba(0, 0, 0, .12));
      }

      #title {
        color: var(--sm-title-color, rgba(0, 0, 0, .6));
        font-weight: 500;
        font-size: 18px;
        margin: 0;
        padding: 18px;
        text-align: center;
      }

      #clipboard-container {
        display: flex;
        min-height: 72px;
        max-height: 192px;
        align-items: center;
        padding: 24px 12px 24px 24px;
        gap: 12px;
      }

      #clipboard-container > img {
        flex: 0;
        width: 100%;
        height: 100%;
        max-width: 288px;
        max-height: 144px;
      }

      #clipboard-container > pre {
        flex: 1;
        font-family: inherit;
        color: var(--sm-preview-color, rgba(0, 0, 0, .6));
        margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      #clipboard-container > button {
        flex: 0 0 72px;
      }

      #targets-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        padding: 12px;
      }

      .target {
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
        font-family: inherit;
        will-change: transform;
        transition: .3s transform;
      }

      .target:hover {
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
        width: 36px;
        height: 36px;
        padding: 7px;
        margin: -5px;
        fill: var(--sm-hint-color, rgba(0, 0, 0, .6));
      }

      .icon::before, .icon::after, .clipboard-icon::before, .clipboard-icon::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: var(--sm-ripple-color, #fff);
        opacity: .3;
        will-change: transform;
        transition: .3s transform;
        transform: scale(0);
      }

      .icon::after, .clipboard-icon::after {
        opacity: .4;
      }

      .target:focus .icon::before,
      .target:active .icon::after,
      .target:focus .clipboard-icon::before,
      .target:active .clipboard-icon::after {
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
        color: var(--sm-labels-color, rgba(0, 0, 0, .87));
        font-size: 14px;
      }

      .hint {
        padding-top: 4px;
        color: var(--sm-hint-color, rgba(0, 0, 0, .6));
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
          <img id="clipboard-image-preview">
          <pre id="clipboard-preview"></pre>
          <button class="target" id="clipboard">
            <div class="clipboard-icon">
              <svg viewBox="0 0 256 256">
                <path d="M180 233H41V70H17v164a23 23 0 0024 22h139zm36-24a23 23 0 0023-23V23v-1a23 23 0 00-24-22H87a23 23 0 00-23 23v163a23 23 0 0023 23h128zm-1-23H87V23h128z"/>
              </svg>
            </div>
            <div class="hint" id="copy-hint"></div>
          </button>
        </div>
        <hr>
        <div id="targets-container"></div>
      </div>
      <slot></slot>
    `;

    // If the shadow root already exists, it means that the component
    // has been rendered on the server using Declarative Shadow DOM,
    // so we don't need to create a new shadow root
    if (this.shadowRoot) {
      return;
    }

    this.attachShadow({ mode: 'open' });
    if (ShareMenu._supportsAdoptingStyleSheets) {
      ShareMenu.stylesheet = new CSSStyleSheet();
      this.shadowRoot.adoptedStyleSheets = [ShareMenu.stylesheet];
    }
    this.shadowRoot.appendChild(this._template.content.cloneNode(true));
  }

  /**
   * Displays the share dialog with the `title`, `text`, and `url` provided as attributes/properties.
   * You can also override their values by passing them as a parameter to this method. This can be particularly
   * useful if you are creating the dialog directly from JavaScript.
   *
   * @param {{ text: string, title: string, url: string }=} props An object containing `text`, `title`, and `url`, that will override the element attributes/properties.
   * @return {Promise<void>} A promise that resolves when the user selects a share target.
   */
  public async share({
    text = this.text,
    title = this.title,
    url = this.url,
    image = this.image,
  }: ShareMenuParams = {}) {
    this.text = text;
    this.title = title;
    this.url = url;
    this.image = image;
    if (!navigator.share) {
      return this._showFallbackShare();
    }
    try {
      const file = await this._filePromise;
      await navigator.share({
        text: this.text || undefined,
        title: this.title || undefined,
        url: this.url || undefined,
        files: file ? [file] : undefined,
      });
      this.opened = false;
      ['share', 'close'].forEach((event) =>
        this._emitCustomEvent(event, { origin: 'native' }),
      );
    } catch (error) {
      // The browser throws an AbortError if user changes their mind and decides
      // not to share anything using the native share menu.
      // In that case, we don't want to show our fallback share menu.
      if ((error as Error).name !== 'AbortError') {
        return this._showFallbackShare();
      }
      this._emitCustomEvent('close', { origin: 'native' });
    }
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
    this._targetsContainerRef =
      this.shadowRoot.querySelector<HTMLDivElement>('#targets-container');
    this._copyHintRef =
      this.shadowRoot.querySelector<HTMLDivElement>('#copy-hint');
    this._copyHintRef.textContent = this.copyHint;

    this._clipboardImagePreviewRef =
      this.shadowRoot.querySelector<HTMLImageElement>(
        '#clipboard-image-preview',
      );
    this._clipboardPreviewRef =
      this.shadowRoot.querySelector<HTMLPreElement>('#clipboard-preview');

    this._clipboardPreviewRef.innerHTML = `${this.title}\n${this.text}\n${this.url}`;

    if (navigator.clipboard) {
      const cliboardButtonRef =
        this.shadowRoot.querySelector<HTMLButtonElement>('#clipboard');

      cliboardButtonRef.addEventListener('click', async () => {
        const textToCopy = [
          ...(this.title ? [this.title] : []),
          ...(this.text ? [this.text] : []),
          ...(this.url ? [this.url] : []),
        ].join('\n\n');
        try {
          const file = await this._filePromise;
          await this._copyToClipboard(textToCopy, file);
          this._emitCustomEvent('share', {
            target: 'clipboard',
            origin: 'fallback',
          });
        } catch (error) {
          this.dispatchEvent(
            new ErrorEvent('error', {
              message: 'Unable to copy to clipboard',
              error,
            }),
          );
        }
        this._close();
      });

      this._firstFocusableElRef = cliboardButtonRef;
    } else {
      const clipboardContainerRef =
        this.shadowRoot.querySelector<HTMLDivElement>('#clipboard-container');

      clipboardContainerRef.parentNode.removeChild(clipboardContainerRef);
    }

    const slotRef = this.shadowRoot.querySelector('slot');

    slotRef.addEventListener('slotchange', async () => {
      const assignedNodes = slotRef.assignedNodes({ flatten: true });
      const rootShareTargets = assignedNodes.filter(
        isShareTargetNode,
      ) as ShareTarget[];
      const nestedShareTargets = assignedNodes
        .filter(isShareTargetPreset)
        .flatMap((target) => Array.from((target as HTMLElement).children));
      const shareTargets = [...rootShareTargets, ...nestedShareTargets].filter(
        isShareTarget,
      );

      await Promise.all(
        shareTargets.map((target) =>
          customElements.whenDefined(target.nodeName.toLowerCase()),
        ),
      );

      this._targets = shareTargets;
      this._renderTargets();
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
          this._clipboardPreviewRef.innerHTML = `${this.title}\n${this.text}\n${this.url}`;
        }
        break;
      case 'image':
        // Instantiate an URL, so that we can handle errors before
        // trying to fetch the image if the URL is invalid
        try {
          const url = new URL(newValue);
          if (this._clipboardImagePreviewRef) {
            this._clipboardImagePreviewRef.src = url.href;
          }
          this._filePromise = this._extractFileFromUrl(url).catch(
            () => undefined,
          );
        } catch {}
        break;
    }
  }

  /** @private */
  private _copyToClipboard(text?: string, blob?: Blob): Promise<void> {
    // Firefox supports writeText but not write
    if (!navigator.clipboard.write) {
      return navigator.clipboard.writeText(text);
    }
    return navigator.clipboard.write([
      new ClipboardItem({
        ...(text && {
          'text/plain': new Blob([text], {
            type: 'text/plain',
          }),
        }),
        ...(blob && { [blob.type]: blob }),
      }),
    ]);
  }

  /** @private */
  private async _extractFileFromUrl(url: URL): Promise<File> {
    const res = await fetch(url);
    const blob = await res.blob();
    return new File([blob], url.pathname.split('/').pop(), { type: blob.type });
  }

  /** @private */
  private _renderTargets() {
    if (!this._targetsContainerRef) {
      return;
    }
    this._targetsContainerRef.innerHTML = '';
    this._targets.forEach((shareTarget, index) => {
      const { nodeName, color, outline, icon, displayName, hint } = shareTarget;
      const logoColor = this._computeContrastColor(outline || color);

      const target = nodeName.slice(13).toLowerCase();
      const targetButton: HTMLButtonElement = document.createElement('button');
      targetButton.className = 'target';
      targetButton.id = target;
      targetButton.title = `${displayName}${hint ? ` ${hint}` : ''}`;
      targetButton.setAttribute('part', 'target-button');
      targetButton.addEventListener('click', () => {
        shareTarget.share(this);
        this._emitCustomEvent('share', { target, origin: 'fallback' });
        this._close();
      });

      const targetIcon: HTMLDivElement = document.createElement('div');
      targetIcon.className = 'icon';
      targetIcon.innerHTML = `<svg viewBox="0 0 256 256" fill="#${logoColor}" ${
        outline
          ? `stroke="#${outline}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"`
          : ''
      }><path d="${icon}"/></svg>`;
      targetIcon.style.background = `#${color}`;
      targetIcon.setAttribute('part', 'target-icon');
      targetButton.appendChild(targetIcon);

      const targetLabel: HTMLDivElement = document.createElement('div');
      targetLabel.className = 'label';
      targetLabel.textContent = displayName;
      targetLabel.setAttribute('part', 'target-label');
      targetButton.appendChild(targetLabel);

      if (hint) {
        const targetHint: HTMLDivElement = document.createElement('div');
        targetHint.className = 'hint';
        targetHint.textContent = hint;
        targetButton.appendChild(targetHint);
      }

      this._targetsContainerRef.appendChild(targetButton);

      if (!navigator.clipboard && index === 0) {
        this._firstFocusableElRef = targetButton;
      }

      if (index === this._targets.length - 1) {
        this._lastFocusableElRef = targetButton;
      }
    });
  }

  public openWindow(
    url: string,
    query: Record<string, string | number | boolean | null | undefined> = {},
    replace?: boolean,
  ) {
    const queryEntries = Object.entries(query);
    return window.open(
      query
        ? `${url}${
            queryEntries.length > 0
              ? `?${new URLSearchParams(
                  queryEntries.reduce(
                    (newQuery, [key, value]) => ({
                      ...newQuery,
                      ...(typeof value !== 'undefined' && {
                        [key]: `${value}`,
                      }),
                    }),
                    {},
                  ),
                ).toString()}`
              : ''
          }`
        : url,
      replace ? '_self' : '_blank',
      `width=${screen.width / 2},height=${screen.height / 2},left=${
        screen.width / 4
      },top=${screen.height / 4},menubar=0,status=0,titlebar=0,toolbar=0`,
    );
  }

  /** @private */
  private _computeContrastColor(hex: string): string {
    const fullHex = hex.length === 3 ? hex.repeat(2) : hex;
    const [r, g, b] = fullHex.match(/.{2}/g).map((c) => parseInt(c, 16));
    return r * 0.299 + g * 0.587 + b * 0.114 <= 186 ? 'fff' : '000';
  }

  /** @private */
  private _emitCustomEvent<T extends ShareMenuShareEvent | ShareMenuCloseEvent>(
    type: string,
    detail: T['detail'],
  ) {
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
    return new Promise<void>((resolve, reject) => {
      this._previousFocus = document.activeElement as HTMLElement;
      this.style.display = 'block';
      this._firstFocusableElRef?.focus();
      this.scrollTop = Math.max(
        window.innerHeight / 2,
        window.innerHeight - this._dialogRef.offsetHeight,
      );
      this.opened = true;
      this._backdropRef.addEventListener('click', this._close.bind(this));
      this.addEventListener('scroll', this._handleScroll.bind(this));
      this.addEventListener('keydown', this._handleKeyDown.bind(this));
      this.addEventListener('share', () => resolve(), { once: true });
      this.addEventListener('error', () => reject(), { once: true });
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
      this._emitCustomEvent('close', { origin: 'fallback' });
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
        if (this._targets.length < 2) {
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

export type ShareMenuEventOrigin = 'fallback' | 'native';

export interface ShareMenuShareEventPayload {
  target?: string;
  origin: ShareMenuEventOrigin;
}
export type ShareMenuShareEvent = CustomEvent<ShareMenuShareEventPayload>;

export interface ShareMenuCloseEventPayload {
  origin: ShareMenuEventOrigin;
}
export type ShareMenuCloseEvent = CustomEvent<ShareMenuCloseEventPayload>;

export interface ShareMenuEventMap extends HTMLElementEventMap {
  share: ShareMenuShareEvent;
  close: ShareMenuCloseEvent;
}

export declare interface ShareMenu {
  addEventListener<K extends keyof ShareMenuEventMap>(
    type: K,
    listener: (this: ShareMenu, ev: ShareMenuEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
}

customElements.define('share-menu', ShareMenu);

declare global {
  interface HTMLElementTagNameMap {
    'share-menu': ShareMenu;
  }
}
