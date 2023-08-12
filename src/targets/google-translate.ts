import type { ShareMenu, ShareTarget } from '../share-menu';

export class GoogleTranslateShareTarget
  extends HTMLElement
  implements ShareTarget
{
  public displayName = 'Translate';
  public readonly color = '4285f4';
  public readonly icon =
    'M230 38H114L102 0H26A26 26 0 0 0 0 26v166a26 26 0 0 0 26 26h89l13 38h102a26 26 0 0 0 26-26V64a26 26 0 0 0-26-26zM66 161a52 52 0 0 1 0-105 51 51 0 0 1 35 14l1 1-16 15v-1a28 28 0 0 0-20-7c-17 0-30 14-30 31s13 31 30 31c18 0 25-11 27-19H65v-20h51v1a40 40 0 0 1 0 8c0 30-20 51-50 51zm77-22a128 128 0 0 0 16 22l-7 7zm10-9h-12l-4-14h51s-5 17-20 35a118 118 0 0 1-15-21zm90 100a13 13 0 0 1-13 13h-89l25-25-10-36 12-12 34 35 9-10-34-34c11-13 20-29 24-45h17v-13h-47V90h-13v13h-25l-15-52h112a13 13 0 0 1 13 13z';

  /**
   * The source language to translate from.
   * Defaults to 'auto' (automatically detected by Google Translate).
   *
   * @return {string}
   */
  public get sourceLanguage(): string {
    return this.getAttribute('source-language') || 'auto';
  }

  public set sourceLanguage(val: string) {
    this.setAttribute('source-language', val);
  }

  /**
   * The target language to translate to.
   * Defaults to current user language.
   *
   * @return {string}
   */
  public get targetLanguage(): string {
    return (
      this.getAttribute('target-language') || navigator.language.slice(0, 2)
    );
  }

  public set targetLanguage(val: string) {
    this.setAttribute('target-language', val);
  }

  /**
   * The interface language for Google Translate.
   * Defaults to the target language.
   *
   * @return {string}
   */
  public get interfaceLanguage(): string {
    return this.getAttribute('interface-language') || this.targetLanguage;
  }

  public set interfaceLanguage(val: string) {
    this.setAttribute('interface-language', val);
  }

  public share(shareMenu: ShareMenu) {
    shareMenu.openWindow('https://translate.google.com/translate', {
      sl: this.sourceLanguage,
      tl: this.targetLanguage,
      hl: this.interfaceLanguage,
      u: shareMenu.url,
      client: 'webapp',
    });
  }
}

customElements.define(
  'share-target-google-translate',
  GoogleTranslateShareTarget,
);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-google-translate': GoogleTranslateShareTarget;
  }
}
