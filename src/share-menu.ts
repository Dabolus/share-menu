import * as socialIcons from './social-icons.js';

// We need to do this because navigator.share does not currently exist in TypeScript typings
interface IShareOptions {
  url?: string;
  text?: string;
  title?: string;
}

interface INavigatorWithShare extends Navigator {
  share: (options: IShareOptions) => Promise<void>;
}

declare var navigator: INavigatorWithShare;

export class ShareMenu extends HTMLElement {
  public text: string;
  public title: string;
  public url: string;
  private _template: HTMLTemplateElement;
  private _previousFocus: HTMLElement;
  private _dialogRef: HTMLDivElement;
  private _dialogTitleRef: HTMLHeadingElement;
  private _socialsContainerRef: HTMLDivElement;
  /* tslint:disable:object-literal-sort-keys */
  private _supportedSocials: { [key: string]: { color: string; title: string; } } = {
    clipboard: {
      color: '#444',
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
        socialButton.addEventListener('click', () => console.log(social));
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
          z-index: -1;
          will-change: z-index;
          transition: .3s z-index step-end;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        :host([opened]) {
          z-index: 100;
          transition: .3s z-index step-start;
        }
        * {
          box-sizing: border-box;
        }
        .backdrop {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          background: #000;
          will-change: opacity;
          transition: .3s opacity cubic-bezier(.4, 0, 1, 1);
          cursor: pointer;
        }
        :host([opened]) .backdrop {
          opacity: .6;
          transition: .3s opacity cubic-bezier(0, 0, .2, 1);
        }
        #dialog {
          z-index: 10;
          background: #fff;
          width: 100%;
          max-width: 640px;
          will-change: transform;
          transform: translateY(100%);
          transition: .3s transform cubic-bezier(.4, 0, 1, 1);
        }
        :host([opened]) #dialog {
          transition: .3s transform cubic-bezier(0, 0, .2, 1);
        }
        #title {
          color: rgba(0, 0, 0, .6);
          font-weight: 400;
          font-size: 14px;
          margin: 12px;
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
      <div class="backdrop" tabindex="-1"></div>
      <div id="dialog" role="dialog" aria-labelledby="title">
        <h2 id="title"></h2>
        <div id="socials-container"></div>
      </div>
    `;
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(this._template.content.cloneNode(true));
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

  private _showFallbackShare() {
    const { innerHeight: windowHeight } = window;
    const { offsetHeight: dialogHeight } = this._dialogRef;
    this._dialogRef.style.transform = `translateY(${-Math.min((windowHeight / 2) - dialogHeight, 0)}px)`;
    this._previousFocus = document.activeElement as HTMLElement;
    requestAnimationFrame(() => this.opened = true);
  }

  private _close() {
    if (!this._previousFocus) {
      this._previousFocus.focus();
      this._previousFocus = null;
    }
  }
}

window.customElements.define('share-menu', ShareMenu);
