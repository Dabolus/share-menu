import * as socialIcons from './social-icons.js';

// We need to do this because navigator.share and navigator.clipboard do not currently exist in TypeScript typings
interface IShareOptions {
  url?: string;
  text?: string;
  title?: string;
}

interface IClipboard {
  read: () => Promise<DataTransfer>;
  readText: () => Promise<string>;
  write: (dataTransfer: DataTransfer) => Promise<void>;
  writeText: (newClipText: string) => Promise<void>;
}

interface INavigatorWithShare extends Navigator {
  share: (options: IShareOptions) => Promise<void>;
  clipboard: IClipboard;
}

declare var navigator: INavigatorWithShare;

// We need to do this because of window.FB (Facebook JS API)
interface IFB {
  ui: (options: {
    href?: string;
    method?: string;
    mobile_iframe?: boolean;
    quote?: string;
  }) => void;
}

interface IWindowWithFBAPI extends Window {
  FB?: IFB;
}

declare var window: IWindowWithFBAPI;

/**
 * `share-menu` is a complete and simple to use share menu that uses
 * [Web Share API](https://developers.google.com/web/updates/2016/10/navigator-share) when possible,
 * with a fallback to a nice share menu that tries to emulate the experience of the native one.
 *
 * -----------------------------------------------------------------------------------------------------------------
 *
 * Here you can see the list of the supported socials, as well as the limitations that each one gives:
 *
 * - Baidu - _URL and title only_
 * - Blogger
 * - Buffer - _URL and title only_
 * - Copy to clipboard
 * - Delicious - _URL and title only_
 * - Digg - _URL and title only_
 * - Douban - _URL and title only_
 * - Email
 * - Evernote - _URL only_
 * - Facebook - _URL only if not using a Facebook App with the `facebook-app-id` parameter_
 * - FlipBoard - _URL and title only_
 * - Google+ - _URL only_
 * - Instapaper
 * - Line - _URL only_
 * - LinkedIn
 * - LiveJournal
 * - Myspace
 * - Odnoklassniki (OK.ru) - _URL and title only_
 * - Pinterest - _Will only be visible if the URL is an image. Look for the `isImage` parameter on the API docs for more info_
 * - Pocket - _URL only_
 * - Print - _Only prints the page at the given URL_
 * - QZone - _URL only_
 * - Reddit - _Shares an URL if there is no text provided, otherwise a text with the URL appended at the end will be shared._
 * - RenRen - _Currently disabled because it does not seem to work
 * - Skype - _URL only_
 * - SMS
 * - StumbleUpon - _URL and title only_
 * - Telegram
 * - Translate - _Only translates the page at the given URL_
 * - Tumblr
 * - Twitter
 * - Viber
 * - VKontakte - _URL only_
 * - Weibo
 * - WhatsApp
 * - WordPress
 * - Xing - _URL only_
 * - Yahoo
 *
 * _The `via` parameter will only be used by Delicious, LinkedIn and Twitter._
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
   * Defaults to "Share with".
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
   * The list of the socials to show.
   * Defaults to all the available socials.
   *
   * @return {Array<string>}
   */
  public get socials(): string[] {
    return this._socials;
  }

  public set socials(val: string[]) {
    this._socials = val;
    if (this._socialsContainerRef) {
      this._socialsContainerRef.innerHTML = '';
      val.forEach((social, index) => {
        if (social === 'pinterest' && !this._urlIsImage) {
          return;
        }
        const { color, title, action } = this._supportedSocials[social];
        const socialButton: HTMLButtonElement = document.createElement('button');
        socialButton.className = 'social';
        socialButton.title = title;
        socialButton.setAttribute('part', 'social-button');
        socialButton.addEventListener('click', () => {
          action();
          this.dispatchEvent(new CustomEvent('share', {
            bubbles: true,
            composed: true,
            detail: { social, origin: 'fallback' },
          }));
          this._close();
        });
        const socialIcon: HTMLDivElement = document.createElement('div');
        socialIcon.className = 'icon';
        socialIcon.innerHTML = (socialIcons as { [key: string]: string })[social];
        socialIcon.style.fill = color;
        socialIcon.setAttribute('part', 'social-icon');
        socialButton.appendChild(socialIcon);
        const socialLabel: HTMLDivElement = document.createElement('div');
        socialLabel.className = 'label';
        socialLabel.textContent = title;
        socialLabel.setAttribute('part', 'social-label');
        socialButton.appendChild(socialLabel);
        this._socialsContainerRef.appendChild(socialButton);
        if (index === 0) {
          this._firstFocusableElRef = socialButton;
        }
        if (index === val.length - 1) {
          this._lastFocusableElRef = socialButton;
        }
      });
    }
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
   * The provider of the content.
   * Note that this is used only by some socials.
   * For example, for Twitter this should be your tag or the tag of your application account.
   *
   * @return {string}
   */
  public get via(): string {
    return this.getAttribute('via');
  }

  public set via(val: string) {
    this.setAttribute('via', val);
  }

  /**
   * Used to tell if the URL is an image or not.
   * It can have three different values:
   *
   * - "no"|false|0  _(default)_ - the URL is not an image (or it should be considered as a normal URL even if it is an image)
   * - "yes"|true|1 - the URL **IS** an image, so it will always be treated as such
   * - "auto" - autodetect whether the URL is an image or not. This may cause a lot of extra network traffic, so **only use it if really necessary**.
   *
   * @return {string}
   */
  public get isImage(): string {
    return this.getAttribute('is-image');
  }

  public set isImage(val: string) {
    this.setAttribute('is-image', val);
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
  public static readonly observedAttributes = ['dialog-title', 'opened', 'url', 'is-image', 'no-backdrop'];

  private readonly _template: HTMLTemplateElement;
  private _previousFocus: HTMLElement;
  private _urlIsImage = false;
  private _firstFocusableElRef: HTMLElement;
  private _lastFocusableElRef: HTMLElement;
  private _backdropRef: HTMLDivElement;
  private _dialogRef: HTMLDivElement;
  private _dialogTitleRef: HTMLHeadingElement;
  private _socialsContainerRef: HTMLDivElement;
  /* tslint:disable:object-literal-sort-keys max-line-length */
  private readonly _supportedSocials: { [key: string]: { color: string; title: string; action: () => void; } } = {
    clipboard: {
      color: '#777',
      title: 'Copy to clipboard',
      action: () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(`${this.title}\n\n${this.text}\n\n${this.url}`).catch(alert);
        }
      },
    },
    facebook: {
      color: '#3b5998',
      title: 'Facebook',
      action: () => {
        if (window.FB) {
          window.FB.ui({
            href: this.url,
            method: 'share',
            mobile_iframe: true,
            quote: this.text,
          });
        } else {
          this._openWindow(`https://www.facebook.com/sharer.php?u=${encodeURIComponent(this.url)}&description=${encodeURIComponent(this.title)}%0A%0A${encodeURIComponent(this.text)}`);
        }
      },
    },
    twitter: {
      color: '#1da1f2',
      title: 'Twitter',
      action: () => {
        this._openWindow(`https://twitter.com/intent/tweet?text=${encodeURIComponent(this.title)}%0A${encodeURIComponent(this.text)}&url=${encodeURIComponent(this.url)}${this.via ? `&via=${encodeURIComponent(this.via)}` : ''}`);
      },
    },
    whatsapp: {
      color: '#25d366',
      title: 'WhatsApp',
      action: () => {
        window.open(`whatsapp://send?text=*${encodeURIComponent(this.title)}*%0A%0A${encodeURIComponent(this.text)}%0A%0A${encodeURIComponent(this.url)}`, '_self');
      },
    },
    telegram: {
      color: '#0088cc',
      title: 'Telegram',
      action: () => {
        this._openWindow(`https://t.me/share/url?url=${encodeURIComponent(this.url)}&text=**${encodeURIComponent(this.title)}**%0A${encodeURIComponent(this.text)}`);
      },
    },
    linkedin: {
      color: '#0077b5',
      title: 'LinkedIn',
      action: () => {
        this._openWindow(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(this.url)}&title=${encodeURIComponent(this.title)}&summary=${encodeURIComponent(this.text)}&source=${encodeURIComponent(this.via)}`);
      },
    },
    gplus: {
      color: '#dd4b39',
      title: 'Google+',
      action: () => {
        this._openWindow(`https://plus.google.com/share?url=${encodeURIComponent(this.url)}`);
      },
    },
    pinterest: {
      color: '#bd081c',
      title: 'Pinterest',
      action: () => {
        // Kinda hacky
        const button = document.createElement('button');
        button.onclick = () => {
          const script = document.createElement('script');
          script.src = `https://assets.pinterest.com/js/pinmarklet.js?r=${Math.random() * 99999999}`;
          document.body.appendChild(script);
        };
        button.style.display = 'none';
        const img = document.createElement('img');
        img.src = this.url;
        img.alt = this.text;
        img.title = this.title;
        img.style.width = '400px';
        img.style.height = 'auto';
        button.appendChild(img);
        document.body.appendChild(button);
        button.click();
      },
    },
    tumblr: {
      color: '#35465c',
      title: 'Tumblr',
      action: () => {
        this._openWindow(`https://www.tumblr.com/widgets/share/tool?canonicalUrl=${encodeURIComponent(this.url)}&title=${encodeURIComponent(this.title)}&caption=${encodeURIComponent(this.text)}`);
      },
    },
    reddit: {
      color: '#ff4500',
      title: 'Reddit',
      action: () => {
        if (this.text) {
          this._openWindow(`https://reddit.com/submit?text=${encodeURIComponent(this.text)}%0A%0A${encodeURIComponent(this.url)}&title=${encodeURIComponent(this.title)}`);
        } else {
          this._openWindow(`https://reddit.com/submit?url=${encodeURIComponent(this.url)}&title=${encodeURIComponent(this.title)}`);
        }
      },
    },
    vk: {
      color: '#45668e',
      title: 'VK',
      action: () => {
        this._openWindow(`https://vk.com/share.php?url=${encodeURIComponent(this.url)}`);
      },
    },
    skype: {
      color: '#00aff0',
      title: 'Skype',
      action: () => {
        this._openWindow(`https://web.skype.com/share?url=${encodeURIComponent(this.url)}`);
      },
    },
    viber: {
      color: '#59267c',
      title: 'Viber',
      action: () => {
        window.open(`viber://forward?text=${encodeURIComponent(this.title)}%0A%0A${encodeURIComponent(this.text)}%0A%0A${encodeURIComponent(this.url)}`, '_self');
      },
    },
    line: {
      color: '#00c300',
      title: 'Line',
      action: () => {
        this._openWindow(`https://lineit.line.me/share/ui?url=${encodeURIComponent(this.url)}`);
      },
    },
    qzone: {
      color: '#ffce00',
      title: 'Qzone',
      action: () => {
        this._openWindow(`https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${encodeURIComponent(this.url)}`);
      },
    },
    wordpress: {
      color: '#0087be',
      title: 'WordPress',
      action: () => {
        const img = this._urlIsImage ? `&i=${encodeURIComponent(this.url)}` : '';
        this._openWindow(`https://wordpress.com/press-this.php?u=${encodeURIComponent(window.location.href)}&t=${encodeURIComponent(this.title)}&s=${encodeURIComponent(this.text)}${img}`);
      },
    },
    blogger: {
      color: '#f57d00',
      title: 'Blogger',
      action: () => {
        this._openWindow(`https://www.blogger.com/blog-this.g?u=${encodeURIComponent(this.url)}&n=${encodeURIComponent(this.title)}&t=${encodeURIComponent(this.text)}`);
      },
    },
    flipboard: {
      color: '#e12828',
      title: 'Flipboard',
      action: () => {
        this._openWindow(`https://share.flipboard.com/bookmarklet/popout?v=2&title=${encodeURIComponent(this.title)}&url=${encodeURIComponent(this.url)}`);
      },
    },
    evernote: {
      color: '#2dbe60',
      title: 'Evernote',
      action: () => {
        this._openWindow(`https://www.evernote.com/clip.action?url=${encodeURIComponent(this.url)}`);
      },
    },
    myspace: {
      color: '#000',
      title: 'Myspace',
      action: () => {
        this._openWindow(`https://myspace.com/post?u=${encodeURIComponent(this.url)}&t=${encodeURIComponent(this.title)}&c=${encodeURIComponent(this.text)}`);
      },
    },
    pocket: {
      color: '#ef4056',
      title: 'Pocket',
      action: () => {
        this._openWindow(`https://getpocket.com/save?url=${encodeURIComponent(this.url)}`);
      },
    },
    livejournal: {
      color: '#004359',
      title: 'LiveJournal',
      action: () => {
        this._openWindow(`http://www.livejournal.com/update.bml?subject=${encodeURIComponent(this.title)}&event=${encodeURIComponent(this.text)}%0A%0A${encodeURIComponent(this.url)}`);
      },
    },
    instapaper: {
      color: '#000',
      title: 'Instapaper',
      action: () => {
        this._openWindow(`https://www.instapaper.com/edit?url=${encodeURIComponent(this.url)}&title=${encodeURIComponent(this.title)}&description=${encodeURIComponent(this.text)}`);
      },
    },
    baidu: {
      color: '#2529d8',
      title: 'Baidu',
      action: () => {
        this._openWindow(`http://cang.baidu.com/do/add?it=${encodeURIComponent(this.title)}&iu=${encodeURIComponent(this.url)}`);
      },
    },
    okru: {
      color: '#ee8208',
      title: 'OK.ru',
      action: () => {
        this._openWindow(`https://connect.ok.ru/dk?st.cmd=WidgetSharePreview&st.shareUrl=${encodeURIComponent(this.url)}&title=${encodeURIComponent(this.title)}`);
      },
    },
    xing: {
      color: '#026466',
      title: 'XING',
      action: () => {
        this._openWindow(`https://www.xing.com/app/user?op=share&url=${encodeURIComponent(this.url)}`);
      },
    },
    delicious: {
      color: '#3399ff',
      title: 'Delicious',
      action: () => {
        this._openWindow(`https://del.icio.us/save?v=5&provider=${encodeURIComponent(this.via)}&noui&jump=close&url=${encodeURIComponent(this.url)}&title=${encodeURIComponent(this.title)}`);
      },
    },
    buffer: {
      color: '#323b43',
      title: 'Buffer',
      action: () => {
        this._openWindow(`https://buffer.com/add?text=${encodeURIComponent(this.title)}&url=${encodeURIComponent(this.url)}`);
      },
    },
    digg: {
      color: '#005be2',
      title: 'Digg',
      action: () => {
        this._openWindow(`https://digg.com/submit?url=${encodeURIComponent(this.url)}&title=${encodeURIComponent(this.title)}`);
      },
    },
    douban: {
      color: '#007610',
      title: 'Douban',
      action: () => {
        this._openWindow(`https://www.douban.com/recommend/?url=${encodeURIComponent(this.url)}&title=${encodeURIComponent(this.title)}`);
      },
    },
    stumbleupon: {
      color: '#eb4924',
      title: 'StumbleUpon',
      action: () => {
        this._openWindow(`https://www.stumbleupon.com/submit?url=${encodeURIComponent(this.url)}&title=${encodeURIComponent(this.title)}`);
      },
    },
    /* renren: {
      color: '#005baa',
      title: 'Renren',
      action: () => {
        this._openWindow(`http://share.renren.com/share/buttonshare.do?link=${encodeURIComponent(this.url)}&title=${encodeURIComponent(this.title)}%0A${encodeURIComponent(this.text)}`);
      },
    }, */
    weibo: {
      color: '#df2029',
      title: 'Weibo',
      action: () => {
        this._openWindow(`http://service.weibo.com/share/share.php?url=${encodeURIComponent(this.url)}&appkey=&title=${encodeURIComponent(this.title)}%0A%0A${encodeURIComponent(this.text)}&pic=&ralateUid=`);
      },
    },
    print: {
      color: '#425563',
      title: 'Print',
      action: () => {
        this._openWindow(this.url).print();
      },
    },
    translate: {
      color: '#4285f4',
      title: 'Translate',
      action: () => {
        const userLang = navigator.language.substring(0, 2);
        this._openWindow(`https://translate.google.it/translate?hl=${userLang}&sl=auto&u=${encodeURIComponent(this.url)}`);
      },
    },
    email: {
      color: '#ffa930',
      title: 'Email',
      action: () => {
        window.open(`mailto:?subject=${encodeURIComponent(this.title)}&body=${encodeURIComponent(this.text)}%0A%0A${encodeURIComponent(this.url)}`, '_self');
      },
    },
    sms: {
      color: '#43695b',
      title: 'SMS',
      action: () => {
        let separator = '?';
        // iOS uses two different separators, so we have to check the iOS version and use the proper one
        if (/iP(hone|od|ad)/.test(navigator.platform)) {
          const v = (navigator.appVersion).match(/OS (\d+)/);
          separator = parseInt(v[1], 10) < 8 ? ';' : '&';
        }
        window.open(`sms:${separator}body=${encodeURIComponent(this.title)}%0A%0A${encodeURIComponent(this.text)}%0A%0A${encodeURIComponent(this.url)}`, '_self');
      },
    },
    yahoo: {
      color: '#410093',
      title: 'Yahoo!',
      action: () => {
        this._openWindow(`https://compose.mail.yahoo.com/?body=${encodeURIComponent(this.title)}%0A%0A${encodeURIComponent(this.text)}%0A%0A%${encodeURIComponent(this.url)}`);
      },
    },
  };
  /* tslint:enable:object-literal-sort-keys max-line-length */
  private _socials: string[] = Object.keys(this._supportedSocials);

  constructor() {
    super();

    this._template = document.createElement('template');
    this._template.innerHTML = `
      <style>
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
        }
        :host([opened]) #dialog {
          transform: translateY(0);
          transition: .3s transform cubic-bezier(0, 0, .2, 1);
        }
        #title {
          color: var(--title-color, rgba(0, 0, 0, .6));
          font-weight: 400;
          font-size: 14px;
          margin: 0;
          padding: 12px;
        }
        #socials-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
        }
        .social {
          width: 72px;
          height: 100px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          cursor: pointer;
          border: none;
          outline: none;
          background: var(--background-color, #fff);
          will-change: transform;
          transition: .3s transform;
        }
        .social:hover {
          transform: scale(1.05);
        }
        .social .icon {
          position: relative;
          width: 48px;
          height: 48px;
          padding: 8px;
        }
        .social .icon::before {
          content: '';
          z-index: -1;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: var(--ripple-color, #000);
          opacity: .12;
          will-change: transform;
          transition: .3s transform;
          transform: scale(0);
        }
        .social:active .icon::before, .social:focus .icon::before {
          transform: scale(1);
        }
        .social .label {
          color: var(--labels-color, rgba(0, 0, 0, .87));
          font-weight: 400;
          font-size: 12px;
          text-align: center;
        }
      </style>
      <div id="backdrop" part="backdrop" tabindex="-1"></div>
      <div id="dialog" part="dialog" role="dialog" aria-labelledby="title">
        <h2 id="title" part="title"></h2>
        <div id="socials-container"></div>
      </div>
    `;
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(this._template.content.cloneNode(true));
  }

  /**
   * Displays the share dialog with the `title`, `text`, `url` and `via` provided as attributes/properties.
   * You can also override their values by passing them as a parameter to this method. This can be particularly
   * useful if you are creating the dialog directly from JavaScript.
   *
   * @param {{ text: string, title: string, url: string, via: string }=} props An object containing `text`, `title`, `url` and `via`, that will override the element attributes/properties.
   * @return {Promise<void>} A promise that resolves when the user selects a social.
   */
  public share(props = {
    text: this.text,
    title: this.title,
    url: this.url,
    via: this.via,
  }) {
    this.text = props.text;
    this.title = props.title;
    this.url = props.url;
    this.via = props.via;
    if (navigator.share) {
      return navigator.share({
        text: this.text,
        title: this.title,
        url: this.url,
      })
        .then(() => {
          this.opened = false;
          this.dispatchEvent(new CustomEvent('share', {
            bubbles: true,
            composed: true,
            detail: { origin: 'native' },
          }));

        })
        .catch(() => this._showFallbackShare());
    }
    return this._showFallbackShare();
  }

  private connectedCallback() {
    if (this.text === null) {
      this.text = (() => {
        const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
        if (description && description.content) {
          return description.content;
        }
        return '';
      })();
    }
    if (this.title === null) {
      this.title = document.title || '';
    }
    if (this.url === null) {
      this.url = (() => {
        const canonical = document.querySelector<HTMLLinkElement>('link[rel=canonical]');
        if (canonical && canonical.href) {
          return canonical.href;
        }
        return window.location.href;
      })();
    }
    if (!this.dialogTitle) {
      this.dialogTitle = 'Share with';
    }

    this._backdropRef = this.shadowRoot.querySelector<HTMLDivElement>('#backdrop');
    this._dialogRef = this.shadowRoot.querySelector<HTMLDivElement>('#dialog');
    this._dialogTitleRef = this.shadowRoot.querySelector<HTMLHeadingElement>('#title');
    this._dialogTitleRef.textContent = this.dialogTitle;
    this._socialsContainerRef = this.shadowRoot.querySelector<HTMLDivElement>('#socials-container');
    this.socials = Object.keys(this._supportedSocials);
  }

  /** @private */
  private attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) {
      return;
    }
    switch (name) {
      case 'dialog-title':
        if (this._dialogTitleRef) {
          this._dialogTitleRef.textContent = newValue;
        }
        break;
      case 'opened':
        if (newValue === null) {
          this._close();
        } else {
          this.share();
        }
        break;
      case 'url':
        if (this.isImage !== 'auto') {
          return;
        }
        let img = new Image();
        img.addEventListener('load', () => {
          this._urlIsImage = true;
          img = null;
          // FIXME: super hack
          this.socials = this.socials;
        });
        img.addEventListener('error', () => {
          this._urlIsImage = false;
          img = null;
          // FIXME: super hack
          this.socials = this.socials;
        });
        img.src = newValue;
        break;
      case 'is-image':
        switch (newValue) {
          case 'yes':
          case 'true':
          case '1':
            this._urlIsImage = true;
            // FIXME: super hack
            this.socials = this.socials;
            break;
          case 'no':
          case 'false':
          case '0':
            this._urlIsImage = false;
            // FIXME: super hack
            this.socials = this.socials;
            break;
          default:
            this.isImage = 'auto';
            break;
        }
        break;
    }
  }

  /** @private */
  private _openWindow(url: string) {
    return window.open(
      url,
      '_blank',
      `width=${screen.width / 2},height=${screen.height / 2},left=${screen.width / 4},top=${screen.height / 4},menubar=0,status=0,titlebar=0,toolbar=0`, // tslint:disable-line:max-line-length
      false,
    );
  }

  /** @private */
  private _showFallbackShare() {
    return new Promise((resolve) => {
      function shareListener(this: ShareMenu) {
        this.removeEventListener('share', shareListener);
        resolve();
      }

      this._previousFocus = document.activeElement as HTMLElement;
      this.style.display = 'block';
      this._firstFocusableElRef.focus();
      this.scrollTop = Math.max(window.innerHeight / 2, window.innerHeight - this._dialogRef.offsetHeight);
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
    setTimeout(() => this.style.display = 'none', 300);
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
        if (this.socials.length < 2) {
          e.preventDefault();
          break;
        }
        const activeEl = this.shadowRoot.activeElement || document.activeElement;
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
}

window.customElements.define('share-menu', ShareMenu);
