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
  init: (options: {
    appId: string;
    autoLogAppEvents: boolean;
    xfbml: boolean;
    version: string;
  }) => void;
  ui: (options: {
    href?: string;
    method?: string;
    mobile_iframe?: boolean;
    quote?: string;
  }) => void;
}

interface IWindowWithFBAPI extends Window {
  fbAsyncInit?: () => void;
  FB?: IFB;
}

declare var window: IWindowWithFBAPI;

export class ShareMenu extends HTMLElement {

  private get _isSecureContext() {
    return window.isSecureContext ||
      window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]';
  }

  public get opened(): boolean {
    return this.hasAttribute('opened');
  }

  public set opened(val: boolean) {
    // Reflect the value of the open property as an HTML attribute.
    if (val) {
      this.setAttribute('opened', '');
    } else {
      this.removeAttribute('opened');
    }
  }

  get dialogTitle(): string {
    return this.getAttribute('dialog-title');
  }

  set dialogTitle(val: string) {
    this.setAttribute('dialog-title', val);
    if (this._dialogTitleRef) {
      this._dialogTitleRef.textContent = val;
    }
  }

  get socials(): string[] {
    return this._socials;
  }

  set socials(val: string[]) {
    this._socials = val;
    if (this._socialsContainerRef) {
      this._socialsContainerRef.innerHTML = '';
      val.forEach((social) => {
        const { color, title } = this._supportedSocials[social];
        const socialButton: HTMLButtonElement = document.createElement('button');
        socialButton.className = 'social';
        socialButton.addEventListener('click', () => {
          // TODO: use a better approach
          (this as { [key: string]: any })[`_${social}Click`]();
          this._close();
        });
        const socialIcon: HTMLDivElement = document.createElement('div');
        socialIcon.className = 'icon';
        socialIcon.innerHTML = (socialIcons as { [key: string]: string })[social];
        socialIcon.style.fill = color;
        socialButton.appendChild(socialIcon);
        const socialLabel: HTMLDivElement = document.createElement('div');
        socialLabel.className = 'label';
        socialLabel.textContent = title;
        socialButton.appendChild(socialLabel);
        this._socialsContainerRef.appendChild(socialButton);
      });
    }
  }

  public text: string;
  public title: string;
  public url: string;
  public via: string;
  private readonly _template: HTMLTemplateElement;
  private _previousFocus: HTMLElement;
  private _urlIsImage = false;
  private readonly _backdropRef: HTMLDivElement;
  private readonly _dialogRef: HTMLDivElement;
  private readonly _dialogTitleRef: HTMLHeadingElement;
  private readonly _socialsContainerRef: HTMLDivElement;
  /* tslint:disable:object-literal-sort-keys */
  private readonly _supportedSocials: { [key: string]: { color: string; title: string; } } = {
    clipboard: {
      color: '#777',
      title: 'Copy to clipboard',
    },
    facebook: {
      color: '#3b5998',
      title: 'Facebook',
    },
    twitter: {
      color: '#1da1f2',
      title: 'Twitter',
    },
    whatsapp: {
      color: '#25d366',
      title: 'WhatsApp',
    },
    telegram: {
      color: '#0088cc',
      title: 'Telegram',
    },
    linkedin: {
      color: '#0077b5',
      title: 'LinkedIn',
    },
    gplus: {
      color: '#dd4b39',
      title: 'Google+',
    },
    pinterest: {
      color: '#bd081c',
      title: 'Pinterest',
    },
    tumblr: {
      color: '#35465c',
      title: 'Tumblr',
    },
    reddit: {
      color: '#ff4500',
      title: 'Reddit',
    },
    vk: {
      color: '#45668e',
      title: 'VK',
    },
    skype: {
      color: '#00aff0',
      title: 'Skype',
    },
    viber: {
      color: '#59267c',
      title: 'Viber',
    },
    line: {
      color: '#00c300',
      title: 'Line',
    },
    qzone: {
      color: '#ffce00',
      title: 'Qzone',
    },
    wordpress: {
      color: '#0087be',
      title: 'WordPress',
    },
    blogger: {
      color: '#f57d00',
      title: 'Blogger',
    },
    flipboard: {
      color: '#e12828',
      title: 'Flipboard',
    },
    evernote: {
      color: '#2dbe60',
      title: 'Evernote',
    },
    myspace: {
      color: '#000',
      title: 'Myspace',
    },
    pocket: {
      color: '#ef4056',
      title: 'Pocket',
    },
    livejournal: {
      color: '#004359',
      title: 'LiveJournal',
    },
    instapaper: {
      color: '#000',
      title: 'Instapaper',
    },
    baidu: {
      color: '#2529d8',
      title: 'Baidu',
    },
    okru: {
      color: '#ee8208',
      title: 'OK.ru',
    },
    xing: {
      color: '#026466',
      title: 'XING',
    },
    delicious: {
      color: '#3399ff',
      title: 'Delicious',
    },
    buffer: {
      color: '#323b43',
      title: 'Buffer',
    },
    digg: {
      color: '#005be2',
      title: 'Digg',
    },
    douban: {
      color: '#007610',
      title: 'Douban',
    },
    stumbleupon: {
      color: '#eb4924',
      title: 'StumbleUpon',
    },
    renren: {
      color: '#005baa',
      title: 'Renren',
    },
    weibo: {
      color: '#df2029',
      title: 'Weibo',
    },
    print: {
      color: '#425563',
      title: 'Print',
    },
    translate: {
      color: '#4285f4',
      title: 'Translate',
    },
    yahoo: {
      color: '#410093',
      title: 'Yahoo!',
    },
    sms: {
      color: '#43695b',
      title: 'SMS',
    },
    email: {
      color: '#ffa930',
      title: 'Email',
    },
  };
  /* tslint:enable:object-literal-sort-keys */
  private _socials: string[] = Object.keys(this._supportedSocials);

  constructor() {
    super();
    this.text = (() => {
      const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (description && description.content) {
        return description.content;
      }
      return '';
    })();
    this.title = document.title || '';
    this.url = (() => {
      const canonical = document.querySelector<HTMLLinkElement>('link[rel=canonical]');
      if (canonical && canonical.href) {
        return canonical.href;
      }
      return window.location.href;
    })();

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
        }
        :host([opened]) {
          z-index: 100;
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
          background: #000;
          will-change: opacity;
          transition: .3s opacity cubic-bezier(.4, 0, 1, 1);
          cursor: pointer;
          z-index: -1;
        }
        :host([opened]) #backdrop {
          opacity: .6;
          transition: .3s opacity cubic-bezier(0, 0, .2, 1);
        }
        #dialog {
          margin: 0 auto;
          background: #fff;
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
          color: rgba(0, 0, 0, .6);
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
          background: #fff;
        }
        .social .icon {
          width: 32px;
          height: 32px;
          margin: 8px;
          flex: 0 0 32px;
        }
        .social .label {
          color: rgba(0, 0, 0, .87);
          font-weight: 400;
          font-size: 12px;
          text-align: center;
        }
      </style>
      <div id="backdrop" tabindex="-1"></div>
      <div id="dialog" role="dialog" aria-labelledby="title">
        <h2 id="title"></h2>
        <div id="socials-container"></div>
      </div>
    `;
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(this._template.content.cloneNode(true));
    this._backdropRef = this.shadowRoot.querySelector<HTMLDivElement>('#backdrop');
    this._dialogRef = this.shadowRoot.querySelector<HTMLDivElement>('#dialog');
    this._dialogTitleRef = this.shadowRoot.querySelector<HTMLHeadingElement>('#title');
    this._socialsContainerRef = this.shadowRoot.querySelector<HTMLDivElement>('#socials-container');
    this.dialogTitle = 'Share with';
    this.socials = Object.keys(this._supportedSocials);
  }

  public share() {
    if (navigator.share && this._isSecureContext) {
      return navigator.share({
        text: this.text,
        title: this.title,
        url: this.url,
      }).catch(() => this._showFallbackShare());
    } else {
      this._showFallbackShare();
    }
  }

  private _openWindow(url: string) {
    return window.open(
      url,
      '_blank',
      `width=${screen.width / 2},height=${screen.height / 2},left=${screen.width / 4},top=${screen.height / 4},menubar=0,status=0,titlebar=0,toolbar=0`, // tslint:disable-line:max-line-length
      false,
    );
  }

  private _showFallbackShare() {
    this._previousFocus = document.activeElement as HTMLElement;
    this._dialogRef.style.marginTop =
      `${Math.max(window.innerHeight / 2, window.innerHeight - this._dialogRef.offsetHeight)}px`;
    this.opened = true;
    this._backdropRef.addEventListener('click', this._close.bind(this));
  }

  private _close() {
    this._backdropRef.removeEventListener('click', this._close);
    this.opened = false;
    this.scroll({
      behavior: 'smooth',
      top: 0,
    });
    if (!this._previousFocus) {
      this._previousFocus.focus();
      this._previousFocus = null;
    }
  }

  /* tslint:disable:max-line-length */
  private _clipboardClick() {
    if (navigator.clipboard && this._isSecureContext) {
      navigator.clipboard.writeText(`${this.title}\n\n${this.text}\n\n${this.url}`);
    }
  }

  private _baiduClick() {
    this._openWindow(`http://cang.baidu.com/do/add?it=${encodeURIComponent(this.title)}&iu=${encodeURIComponent(this.url)}`);
  }

  private _bloggerClick() {
    this._openWindow(`https://www.blogger.com/blog-this.g?u=${encodeURIComponent(this.url)}&n=${encodeURIComponent(this.title)}&t=${encodeURIComponent(this.text)}`);
  }

  private _bufferClick() {
    this._openWindow(`https://buffer.com/add?text=${encodeURIComponent(this.title)}&url=${encodeURIComponent(this.url)}`);
  }

  private _deliciousClick() {
    this._openWindow(`https://del.icio.us/save?v=5&provider=${encodeURIComponent(this.via)}&noui&jump=close&url=${encodeURIComponent(this.url)}&title=${encodeURIComponent(this.title)}`);
  }

  private _diggClick() {
    this._openWindow(`https://digg.com/submit?url=${encodeURIComponent(this.url)}&title=${encodeURIComponent(this.title)}`);
  }

  private _doubanClick() {
    this._openWindow(`https://www.douban.com/recommend/?url=${encodeURIComponent(this.url)}&title=${encodeURIComponent(this.title)}`);
  }

  private _emailClick() {
    window.open(`mailto:?subject=${encodeURIComponent(this.title)}&body=${encodeURIComponent(this.text)}%0A%0A${encodeURIComponent(this.url)}`, '_self');
  }

  private _evernoteClick() {
    this._openWindow(`https://www.evernote.com/clip.action?url=${encodeURIComponent(this.url)}`);
  }

  private _facebookClick() {
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
  }

  private _flipboardClick() {
    this._openWindow(`https://share.flipboard.com/bookmarklet/popout?v=2&title=${encodeURIComponent(this.title)}&url=${encodeURIComponent(this.url)}`);
  }

  private _gplusClick() {
    this._openWindow(`https://plus.google.com/share?url=${encodeURIComponent(this.url)}`);
  }

  private _instapaperClick() {
    this._openWindow(`https://www.instapaper.com/edit?url=${encodeURIComponent(this.url)}&title=${encodeURIComponent(this.title)}&description=${encodeURIComponent(this.text)}`);
  }

  private _lineClick() {
    this._openWindow(`https://lineit.line.me/share/ui?url=${encodeURIComponent(this.url)}`);
  }

  private _linkedinClick() {
    this._openWindow(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(this.url)}&title=${encodeURIComponent(this.title)}&summary=${encodeURIComponent(this.text)}&source=${encodeURIComponent(this.via)}`);
  }

  private _livejournalClick() {
    this._openWindow(`http://www.livejournal.com/update.bml?subject=${encodeURIComponent(this.title)}&event=${encodeURIComponent(this.text)}%0A%0A${encodeURIComponent(this.url)}`);
  }

  private _myspaceClick() {
    this._openWindow(`https://myspace.com/post?u=${encodeURIComponent(this.url)}&t=${encodeURIComponent(this.title)}&c=${encodeURIComponent(this.text)}`);
  }

  private _okruClick() {
    this._openWindow(`https://connect.ok.ru/dk?st.cmd=WidgetSharePreview&st.shareUrl=${encodeURIComponent(this.url)}&title=${encodeURIComponent(this.title)}`);
  }

  private _pinterestClick() {
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
  }

  private _pocketClick() {
    this._openWindow(`https://getpocket.com/save?url=${encodeURIComponent(this.url)}`);
  }

  private _printClick() {
    this._openWindow(this.url).print();
  }

  private _qzoneClick() {
    this._openWindow(`https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${encodeURIComponent(this.url)}`);
  }

  private _redditClick() {
    if (this.text) {
      this._openWindow(`https://reddit.com/submit?text=${encodeURIComponent(this.text)}%0A%0A${encodeURIComponent(this.url)}&title=${encodeURIComponent(this.title)}`);
    }
    else {
      this._openWindow(`https://reddit.com/submit?url=${encodeURIComponent(this.url)}&title=${encodeURIComponent(this.title)}`);
    }
  }

  private _renrenClick() {
    this._openWindow(`http://share.renren.com/share/buttonshare.do?link=${encodeURIComponent(this.url)}&title=${encodeURIComponent(this.title)}%0A${encodeURIComponent(this.text)}`);
  }

  private _skypeClick() {
    this._openWindow(`https://web.skype.com/share?url=${encodeURIComponent(this.url)}`);
  }

  private _smsClick() {
    let separator = '?';
    // iOS uses two different separators, so we have to check the iOS version and use the proper one
    if (/iP(hone|od|ad)/.test(navigator.platform)) {
      const v = (navigator.appVersion).match(/OS (\d+)/);
      separator = parseInt(v[1], 10) < 8 ? ';' : '&';
    }
    window.open(`sms:${separator}body=${encodeURIComponent(this.title)}%0A%0A${encodeURIComponent(this.text)}%0A%0A${encodeURIComponent(this.url)}`, '_self');
  }

  private _stumbleuponClick() {
    this._openWindow(`https://www.stumbleupon.com/submit?url=${encodeURIComponent(this.url)}&title=${encodeURIComponent(this.title)}`);
  }

  private _telegramClick() {
    this._openWindow(`https://t.me/share/url?url=${encodeURIComponent(this.url)}&text=**${encodeURIComponent(this.title)}**%0A${encodeURIComponent(this.text)}`);
  }

  private _translateClick() {
    const userLang = navigator.language.substring(0, 2);
    this._openWindow(`https://translate.google.it/translate?hl=${userLang}&sl=auto&u=${encodeURIComponent(this.url)}`);
  }

  private _tumblrClick() {
    this._openWindow(`https://www.tumblr.com/widgets/share/tool?canonicalUrl=${encodeURIComponent(this.url)}&title=${encodeURIComponent(this.title)}&caption=${encodeURIComponent(this.text)}`);
  }

  private _twitterClick() {
    this._openWindow(`https://twitter.com/intent/tweet?text=${encodeURIComponent(this.title)}%0A${encodeURIComponent(this.text)}&url=${encodeURIComponent(this.url)}&via=${encodeURIComponent(this.via)}`);
    // Alternative method
    // window.open(`twitter://post?text=${encodeURIComponent(this.title)}%0A${encodeURIComponent(this.text)}+${encodeURIComponent(this.url)}+via+%40${encodeURIComponent(this.via)}`, '_self');
  }

  private _viberClick() {
    window.open(`viber://forward?text=${encodeURIComponent(this.title)}%0A%0A${encodeURIComponent(this.text)}%0A%0A${encodeURIComponent(this.url)}`, '_self');
  }

  private _vkClick() {
    this._openWindow(`https://vk.com/share.php?url=${encodeURIComponent(this.url)}`);
  }

  private _weiboClick() {
    this._openWindow(`http://service.weibo.com/share/share.php?url=${encodeURIComponent(this.url)}&appkey=&title=${encodeURIComponent(this.title)}%0A%0A${encodeURIComponent(this.text)}&pic=&ralateUid=`);
  }

  private _whatsappClick() {
    window.open(`whatsapp://send?text=*${encodeURIComponent(this.title)}*%0A%0A${encodeURIComponent(this.text)}%0A%0A${encodeURIComponent(this.url)}`, '_self');
  }

  private _wordpressClick() {
    const img = this._urlIsImage ? `&i=${encodeURIComponent(this.url)}` : '';
    this._openWindow(`https://wordpress.com/press-this.php?u=${encodeURIComponent(window.location.href)}&t=${encodeURIComponent(this.title)}&s=${encodeURIComponent(this.text)}${img}`);
  }

  private _xingClick() {
    this._openWindow(`https://www.xing.com/app/user?op=share&url=${encodeURIComponent(this.url)}`);
  }

  private _yahooClick() {
    this._openWindow(`https://compose.mail.yahoo.com/?body=${encodeURIComponent(this.title)}%0A%0A${encodeURIComponent(this.text)}%0A%0A%${encodeURIComponent(this.url)}`);
  }

  /* tslint:enable:max-line-length */
}

window.customElements.define('share-menu', ShareMenu);
