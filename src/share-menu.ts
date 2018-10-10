export class ShareMenu extends HTMLElement {
  public text: string;
  public title: string;
  public url: string;

  private get _isSecureContext() {
    return window.isSecureContext ||
      window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]';
  }

  public share() {
    // We need to do this because navigator.share does not currently exist in TypeScript typings
    const nav: any = navigator;

    if (nav.share && this._isSecureContext) {
      return nav.share({
        text: this.text,
        title: this.title,
        url: this.url,
      });
    } else {
      throw new Error('Not implemented yet');
    }
  }

  private connectedCallback() {
    this.text = document.querySelector('meta[name="description"]').getAttribute('content') || '';
    this.title = document.title || '';
    this.url = (() => {
      const canonical = document.querySelector<HTMLLinkElement>('link[rel=canonical]');
      if (canonical && canonical.href) {
        return canonical.href;
      }
      return window.location.href;
    })();
  }
}

window.customElements.define('share-menu', ShareMenu);
