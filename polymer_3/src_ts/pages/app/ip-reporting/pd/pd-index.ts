import {ReduxConnectedElement} from '../../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import '../../../../elements/page-body';
import '../../../../elements/page-header';
import '../../../../elements/ip-reporting/pd-filters';
import '../../../../elements/ip-reporting/pd-list-toolbar';
import '../../../../elements/ip-reporting/pd-list';
import LocalizeMixin from '../../../../mixins/localize-mixin';


/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class PageIpReportingPdIndex extends LocalizeMixin(ReduxConnectedElement) {

  public static get template() {
    return html`
    <style>
      :host {
        display: block;
      }
    </style>

    <page-header title="[[localize('programme_documents')]]"></page-header>

    <page-body>
      <pd-filters></pd-filters>
      <pd-list-toolbar></pd-list-toolbar>
      <pd-list></pd-list>
    </page-body>
  `;
  }


}

window.customElements.define('page-ip-reporting-pd-index', PageIpReportingPdIndex);
