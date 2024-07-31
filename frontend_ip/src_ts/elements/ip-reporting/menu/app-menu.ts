import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';

import {navMenuStyles} from './styles/nav-menu-styles';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {getCorrespondingEtoolsEnvironment, SMALL_MENU_ACTIVE_LOCALSTORAGE_KEY} from '../../../etools-prp-common/config';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';
import UtilsMixin from '../../../etools-prp-common/mixins/utils-mixin';
import {connect} from 'pwa-helpers';
import {store} from '../../../redux/store';
import RoutingMixin from '../../../etools-prp-common/mixins/routing-mixin';
import {translate} from 'lit-translate';
import {RootState} from '../../../typings/redux.types';

/**
 * main menu
 * @LitElement
 * @customElement
 */
@customElement('app-menu')
export class AppMenu extends RoutingMixin(MatomoMixin(UtilsMixin(connect(store)(LitElement)))) {
  static get styles() {
    return [navMenuStyles];
  }

  public render() {
    // main template
    // language=HTML
    return html`
      <div class="menu-header">
        <span id="app-name"> ePD </span>

        <sl-tooltip for="menu-header-top-icon" placement="right" content="ePD">
          <span class="ripple-wrapper main">
            <etools-icon
              id="menu-header-top-icon"
              name="assignment-ind"
              @click="${() => this._toggleSmallMenu()}"
            ></etools-icon>
          </span>
        </sl-tooltip>

        <span class="chev-right">
          <etools-icon id="expand-menu" name="chevron-right" @click="${() => this._toggleSmallMenu()}"></etools-icon>
        </span>

        <span class="ripple-wrapper">
          <etools-icon id="minimize-menu" name="chevron-left" @click="${() => this._toggleSmallMenu()}"></etools-icon>
        </span>
      </div>

      <div class="nav-menu">
        <div class="menu-selector" role="navigation">
          <a
            class="nav-menu-item ${this.getItemClass(this.selectedOption, 'overview')}"
            href="${this.overviewUrl}"
            @click="${this.trackAnalytics}"
            tracker="Overview"
          >
            <sl-tooltip for="overview-icon" placement="right" content="${translate('OVERVIEW')}">
              <etools-icon id="overview-icon" name="globe"></etools-icon>
            </sl-tooltip>
            <div class="name">${translate('OVERVIEW')}</div>
          </a>

          <a
            class="nav-menu-item ${this.getItemClass(this.selectedOption, 'pd')}"
            href="${this._appendQuery(this.pdUrl, this.pdQuery)}"
            @click="${this.trackAnalytics}"
            tracker="Programme Documents"
          >
            <sl-tooltip for="programme_documents-icon" placement="right" content="${translate('PROGRAMME_DOCUMENTS')}">
              <etools-icon id="programme_documents-icon" name="description"></etools-icon>
            </sl-tooltip>
            <div class="name">${translate('PROGRAMME_DOCUMENTS')}</div>
          </a>

          <a
            class="nav-menu-item ${this.getItemClass(this.selectedOption, 'progress-reports')}"
            href="${this._appendQuery(this.progressReportsUrl, this.reportsQuery)}"
            @click="${this.trackAnalytics}"
            tracker="Progress Reports"
          >
            <sl-tooltip for="progress_reports-icon" placement="right" content="${translate('PROGRESS_REPORTS')}">
              <etools-icon id="progress_reports-icon" name="assignment"></etools-icon>
            </sl-tooltip>
            <div class="name">${translate('PROGRESS_REPORTS')}</div>
          </a>

          <a
            class="nav-menu-item ${this.getItemClass(this.selectedOption, 'indicators')}"
            href="${this._appendQuery(this.indicatorsReportsUrl, this.indicatorsQuery)}"
            @click="${this.trackAnalytics}"
            tracker="Indicators"
          >
            <sl-tooltip for="indicators-icon" placement="right" content="${translate('INDICATORS')}">
              <etools-icon id="indicators-icon" name="trending-up"></etools-icon>
            </sl-tooltip>
            <div class="name">${translate('INDICATORS')}</div>
          </a>

          <hr />

          <a class="nav-menu-item" href="${this.getAMPUrl()}" target="_blank">
            <sl-tooltip for="amp-icon" placement="right" content="${translate('AMP')}">
              <etools-icon id="amp-icon" name="people"></etools-icon>
            </sl-tooltip>
            <div class="name">${translate('AMP')}</div>
          </a>
        </div>

        <div class="nav-menu-item section-title">
          <span>${translate('COMMUNITY_CHANNELS')}</span>
        </div>

        <a
          class="nav-menu-item lighter-item"
          href="https://unpartnerportalcso.zendesk.com/hc/en-us/sections/12663538797975-Electronic-Programme-Document-ePD-"
          target="_blank"
          @click="${this.trackAnalytics}"
          tracker="Knowledge base"
        >
          <sl-tooltip for="knoledge-icon" placement="right" content="${translate('KNOWLEDGE_BASE')}">
            <etools-icon id="knoledge-icon" name="maps:local-library"></etools-icon>
          </sl-tooltip>
          <div class="name">${translate('KNOWLEDGE_BASE')}</div>
        </a>
      </div>
    `;
  }

  @property({type: String, attribute: 'selected-option'})
  selectedOption = '';

  @property({type: Boolean, attribute: 'small-menu'})
  smallMenu = false;

  @property({type: Object})
  pdQuery = {status: String(['signed', 'active', 'suspended'])};

  @property({type: Object})
  reportsQuery = {status: String(['Due', 'Ove', 'Sen'])};

  @property({type: Object})
  indicatorsQuery = {pd_statuses: String(['active'])};

  @property({type: String})
  overviewUrl!: string;

  @property({type: String})
  pdUrl!: string;

  @property({type: String})
  progressReportsUrl!: string;

  @property({type: String})
  indicatorsReportsUrl!: string;

  public _toggleSmallMenu(): void {
    this.smallMenu = !this.smallMenu;
    const localStorageVal: number = this.smallMenu ? 1 : 0;
    localStorage.setItem(SMALL_MENU_ACTIVE_LOCALSTORAGE_KEY, String(localStorageVal));
    fireEvent(this, 'toggle-small-menu', {value: this.smallMenu});
  }

  getItemClass(selectedValue: string, itemValue: string) {
    return selectedValue === itemValue ? 'selected' : '';
  }

  stateChanged(state: RootState): void {
    if (state.workspaces?.baseUrl) {
      this._baseUrl = state.workspaces?.baseUrl;
      this.overviewUrl = this.buildUrl(this._baseUrl, 'overview');
      this.pdUrl = this.buildUrl(this._baseUrl, 'pd');
      this.progressReportsUrl = this.buildUrl(this._baseUrl, 'progress-reports');
      this.indicatorsReportsUrl = this.buildUrl(this._baseUrl, 'indicators');
    }
  }

  getAMPUrl(): string {
    return `${getCorrespondingEtoolsEnvironment()}/amp/`;
  }
}
