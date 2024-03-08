import { XShareTarget as TwitterShareTarget } from './x.js';
export { TwitterShareTarget };

customElements.define('share-target-twitter', TwitterShareTarget);

declare global {
  interface HTMLElementTagNameMap {
    'share-target-twitter': TwitterShareTarget;
  }
}
