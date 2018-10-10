export class ShareMenu extends HTMLElement {
  public text: string;
  public title: string;
  public url: string;
  private _template: HTMLTemplateElement;
  private _root: ShadowRoot;
  private _previousFocus: HTMLElement;

  private get _isSecureContext() {
    return window.isSecureContext ||
      window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]';
  }

  get opened(): boolean {
    return this.hasAttribute('opened');
  }

  set opened(val: boolean) {
    // Reflect the value of the open property as an HTML attribute.
    if (val) {
      this.setAttribute('opened', '');
    } else {
      this.removeAttribute('opened');
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
        .backdrop {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          background: #000;
          will-change: opacity;
          transition: .3s opacity cubic-bezier(0.4, 0.0, 1, 1);
          cursor: pointer;
        }
        :host([opened]) .backdrop {
          opacity: .54;
          transition: .3s opacity cubic-bezier(0.0, 0.0, 0.2, 1);
        }
        .modal {
          z-index: 10;
          background: #fff;
          width: 100%;
          max-width: 640px;
          will-change: transform;
          transform: translateY(100%);
          transition: .3s transform cubic-bezier(0.4, 0.0, 1, 1);
        }
        :host([opened]) .modal {
          transform: translateY(0);
          transition: .3s transform cubic-bezier(0.0, 0.0, 0.2, 1);
        }
      </style>
      <div class="backdrop" tabindex="-1"></div>
      <div class="modal" role="dialog" aria-labelledby="">
        <span>ciao</span>
      </div>
    `;
    this._root = this.attachShadow({ mode: 'open' });
    this._root.appendChild(this._template.content.cloneNode(true));
  }

  public share() {
    // We need to do this because navigator.share does not currently exist in TypeScript typings
    if ((navigator as any).share && this._isSecureContext) {
      return (navigator as any).share({
        text: this.text,
        title: this.title,
        url: this.url,
      }).catch(() => this._fallbackShare());
    } else {
      this._fallbackShare();
    }
  }

  private _fallbackShare() {
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
