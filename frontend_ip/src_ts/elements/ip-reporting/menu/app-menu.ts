import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';

import {navMenuStyles} from './styles/nav-menu-styles';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {getCorrespondingEtoolsEnvironment, SMALL_MENU_ACTIVE_LOCALSTORAGE_KEY} from '../../../etools-prp-common/config';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {store} from '../../../redux/store';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {RootState} from '../../../typings/redux.types';
import {buildUrl} from '../../../etools-prp-common/utils/util';
import {AnyObject} from '@unicef-polymer/etools-utils/dist/types/global.types';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {appendQuery} from '@unicef-polymer/etools-utils/dist/navigation.util';

/**
 * main menu
 * @LitElement
 * @customElement
 */
@customElement('app-menu')
export class AppMenu extends MatomoMixin(connect(store)(LitElement)) {
  public render() {
    // main template
    // language=HTML
    return html`
      <style>
        ${navMenuStyles}
      </style>
      <div class="menu-header">
        <span id="app-name"> IP Reporting </span>

        <sl-tooltip for="menu-header-top-icon" placement="right" content="IP Reporting">
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
          ${this.partner?.partner_type === 'Gov'
            ? html`
                <a
                  class="nav-menu-item ${this.getItemClass(this.selectedOption, 'gpd')}"
                  href="${appendQuery(this.gpdUrl, this.gpdQuery)}"
                  @click="${this.trackAnalytics}"
                  tracker="Government Programme Document"
                >
                  <sl-tooltip for="programme_documents-icon" placement="right" content="${translate('GDD')}">
                    <etools-icon id="programme_documents-icon" name="description"></etools-icon>
                  </sl-tooltip>
                  <div class="name">${translate('GDD')}</div>
                </a>
              `
            : html` <a
                class="nav-menu-item ${this.getItemClass(this.selectedOption, 'pd')}"
                href="${appendQuery(this.pdUrl, this.pdQuery)}"
                @click="${this.trackAnalytics}"
                tracker="Programme Documents"
              >
                <sl-tooltip
                  for="programme_documents-icon"
                  placement="right"
                  content="${translate('PROGRAMME_DOCUMENTS')}"
                >
                  <etools-icon id="programme_documents-icon" name="description"></etools-icon>
                </sl-tooltip>
                <div class="name">${translate('PROGRAMME_DOCUMENTS')}</div>
              </a>`}
          <a
            class="nav-menu-item ${this.getItemClass(this.selectedOption, 'progress-reports')}"
            href="${appendQuery(this.progressReportsUrl, this.reportsQuery)}"
            @click="${this.trackAnalytics}"
            tracker="Progress Reports"
          >
            <sl-tooltip for="progress_reports-icon" placement="right" content="${translate('PROGRESS_REPORTS')}">
              <etools-icon id="progress_reports-icon" name="assignment"></etools-icon>
            </sl-tooltip>
            <div class="name">${translate('PROGRESS_REPORTS')}</div>
          </a>

          ${this.partner?.partner_type && this.partner?.partner_type !== 'Gov'
            ? html` <a
                class="nav-menu-item ${this.getItemClass(this.selectedOption, 'indicators')}"
                href="${appendQuery(this.indicatorsReportsUrl, this.indicatorsQuery)}"
                @click="${this.trackAnalytics}"
                tracker="Indicators"
              >
                <sl-tooltip for="indicators-icon" placement="right" content="${translate('INDICATORS')}">
                  <etools-icon id="indicators-icon" name="trending-up"></etools-icon>
                </sl-tooltip>
                <div class="name">${translate('INDICATORS')}</div>
              </a>`
            : ``}

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
  gpdQuery = {status: String(['approved', 'active', 'suspended'])};

  @property({type: Object})
  reportsQuery = {status: String(['Due', 'Ove', 'Sen'])};

  @property({type: Object})
  indicatorsQuery = {pd_statuses: String(['active'])};

  @property({type: String})
  overviewUrl!: string;

  @property({type: String})
  pdUrl!: string;

  @property({type: String})
  gpdUrl!: string;

  @property({type: String})
  progressReportsUrl!: string;

  @property({type: String})
  baseUrl!: string;

  @property({type: String})
  indicatorsReportsUrl!: string;

  @property({type: Object})
  partner!: AnyObject;

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
    if (!isJsonStrMatch(state.partner?.current, this.partner)) {
      this.partner = {...state.partner?.current};
    }
    if (state.workspaces?.baseUrl && state.workspaces.baseUrl !== this.baseUrl) {
      this.baseUrl = state.workspaces.baseUrl;
      this.overviewUrl = buildUrl(this.baseUrl, 'overview');
      this.pdUrl = buildUrl(this.baseUrl, 'pd');
      this.gpdUrl = buildUrl(this.baseUrl, 'gpd');
      this.progressReportsUrl = buildUrl(this.baseUrl, 'progress-reports');
      this.indicatorsReportsUrl = buildUrl(this.baseUrl, 'indicators');
    }
  }

  getAMPUrl(): string {
    return `${getCorrespondingEtoolsEnvironment()}/amp/`;
  }
}
