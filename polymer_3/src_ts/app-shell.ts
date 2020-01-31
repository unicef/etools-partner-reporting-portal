import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import {customElement} from '@polymer/decorators';

@customElement('app-shell')
class AppShell extends PolymerElement {
  public static get template() {
    return html`
      Polymer 3 migration
    `;
  }
}
