import {LitElement, html, css} from 'lit';
import {property, customElement, state} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import {buttonsStyles} from '../etools-prp-common/styles/buttons-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {store} from '../redux/store';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';

@customElement('etools-prp-toolbar')
export class EtoolsPrpToolbar extends connect(store)(LitElement) {
  static styles = [layoutStyles,
    css`
      :host {
        display: block;
        margin: 25px 0;
      }
      .reverse {
        flex-direction: row-reverse;
      }
    `
  ];

  @property({type: String, reflect: true})
  properties!: string;

  @state()
  _responsePlanId!: string;

  @state()
  _locationId!: string;

  @state()
  _pdId!: string;

  @state()
  _reportId!: string;

  @property({type: String, reflect: true})
  responsePlanId!: string;

  @property({type: String, reflect: true})
  locationId!: string;

  @property({type: String, reflect: true})
  pdId!: string;

  @property({type: String, reflect: true})
  reportId!: string;

  @property({type: String, reflect: true})
  query!: string;

  @property({type: Object, reflect: true})
  params!: any;

  stateChanged(state: any) {
    if (state.app?.routeDetails?.queryParams && !isJsonStrMatch(this.params, state.app?.routeDetails?.queryParams)) {
      this.params = state.app?.routeDetails.queryParams;
    }

    if (this._responsePlanId !== state.responsePlans.currentID) {
      this._responsePlanId = state.responsePlans.currentID;
    }
    if (this._locationId !== state.location.id) {
      this._locationId = state.location.id;
    }
    if (this._pdId !== state.programmeDocuments.current) {
      this._pdId = state.programmeDocuments.current;
    }
    if (this._reportId !== state.programmeDocumentReports.current.id) {
      this._reportId = state.programmeDocumentReports.current.id;
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('_responsePlanId')) {
      this.responsePlanId = this._identity(this._responsePlanId);
      this._dispatchEvent('responsePlanId', this.responsePlanId);
    }
    if (changedProperties.has('_locationId')) {
      this.locationId = this._identity(this._locationId);
      this._dispatchEvent('locationId', this.locationId);
    }
    if (changedProperties.has('_pdId')) {
      this.pdId = this._identity(this._pdId);
      this._dispatchEvent('pdId', this.pdId);
    }
    if (changedProperties.has('_reportId')) {
      this.reportId = this._identity(this._reportId);
      this._dispatchEvent('reportId', this.reportId);
    }
    if (changedProperties.has('query')) {
      this._dispatchEvent('query', this.query);
    }
    if (changedProperties.has('params')) {
      this._dispatchEvent('params', this.params);
    }
    if (changedProperties.has('properties')) {
      this._dispatchEvent('properties', this.properties);
    }
  }

  _identity(value: string): string {
    return value;
  }

  _dispatchEvent(propName: string, value: any) {
    fireEvent(this, `${propName}-changed`, {value});
  }

  render() {
    return html`
      ${buttonsStyles}
      <div class="layout-horizontal reverse">
        <slot></slot>
      </div>
    `;
  }
}
