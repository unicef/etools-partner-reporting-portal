import '@polymer/paper-button/paper-button';
import {customElement, html, LitElement, property} from 'lit-element';
import {connect} from 'pwa-helpers/connect-mixin';
import {translate} from 'lit-translate';
import {RootState, store} from '../../../redux/store';

import '../../common/layout/page-content-header/page-content-header';
// eslint-disable-next-line max-len
import {pageContentHeaderSlottedStyles} from '../../common/layout/page-content-header/page-content-header-slotted-styles';

import {AnyObject} from '../../../types/globals';
import '@unicef-polymer/etools-filters/src/etools-filters';
import {updateFilterSelectionOptions, updateFiltersSelectedValues} from '@unicef-polymer/etools-filters/src/filters';
import {defaultFilters, FilterKeysAndTheirSelectedValues} from './list/filters';
import {ROOT_PATH} from '../../../config/config';
import {EtoolsFilter} from '@unicef-polymer/etools-filters/src/etools-filters';
import {pageLayoutStyles} from '../../styles/page-layout-styles';
import {buttonsStyles} from '../../styles/button-styles';
import {elevationStyles} from '../../styles/lit-styles/elevation-styles';
import '@unicef-polymer/etools-table/etools-table';
import {
  EtoolsTableColumn,
  EtoolsTableColumnSort,
  EtoolsTableColumnType,
  EtoolsTableChildRow
} from '@unicef-polymer/etools-table/etools-table';
import {
  EtoolsPaginator,
  defaultPaginator,
  getPaginatorWithBackend
} from '@unicef-polymer/etools-table/pagination/etools-pagination';
import {
  buildUrlQueryString,
  EtoolsTableSortItem,
  getSelectedFiltersFromUrlParams,
  getSortFields,
  getSortFieldsFromUrlSortParams,
  getUrlQueryStringSort
} from '../../common/layout/etools-table-utility';
import {RouteDetails, RouteQueryParams} from '../../../routing/router';
import {updateAppLocation, replaceAppLocation} from '../../../routing/routes';
import {SharedStylesLit} from '../../styles/shared-styles-lit';

import '@unicef-polymer/etools-loading';
import get from 'lodash-es/get';
import {etoolsEndpoints} from '../../../endpoints/endpoints-list';
import {getEndpoint} from '../../../endpoints/endpoints';
import {sendRequest} from '@unicef-polymer/etools-ajax';
import {USER_TYPE} from '../../common/constants';
import {getUserTypeLabel} from '../../utils/utils';
import {TableStyles} from './list/table-styles';

/**
 * @LitElement
 * @customElement
 */
@customElement('ip-reporting-list')
export class IpReportingList extends connect(store)(LitElement) {
  static get styles() {
    return [elevationStyles, buttonsStyles, pageLayoutStyles, pageContentHeaderSlottedStyles];
  }

  public render() {
    // main template
    // language=HTML
    return html`
      ${SharedStylesLit}
      <style>
        etools-table {
          padding-top: 12px;
        }
        .action {
          text-align: right;
        }
        @media (max-width: 576px) {
          .action {
            text-align: right;
          }
          #addBtn {
            padding-right: 16px;
            margin-right: 32px;
          }
        }
      </style>
      <page-content-header>
        <h1 slot="page-title">${translate('USERS')}</h1>

        <div slot="title-row-actions" class="content-header-actions">
          <div class="action">
            <paper-button id="addBtn" class="primary left-icon" raised @tap="${this.goToAddnewPage}">
              <iron-icon icon="add"></iron-icon><span>NEW</span>
            </paper-button>
          </div>
        </div>
      </page-content-header>

      <section class="elevation page-content filters" elevation="1">
        <etools-filters
          .filters="${this.filters}"
          @filter-change="${this.filtersChange}"
          .textFilters="${translate('FILTERS')}"
          .textClearAll="${translate('CLEAR_ALL')}"
        ></etools-filters>
      </section>

      <section class="elevation page-content no-padding" elevation="1">
        <etools-loading loading-text="Loading..." .active="${this.showLoading}"></etools-loading>
        <etools-table
          .caption="${this.tableCaption}"
          .columns="${this.listColumns}"
          .items="${this.listData}"
          .paginator="${this.paginator}"
          .getChildRowTemplateMethod="${this.getChildRowTemplate.bind(this)}"
          .extraCSS="${TableStyles}"
          @paginator-change="${this.paginatorChange}"
          @sort-change="${this.sortChange}"
        ></etools-table>
      </section>
    `;
  }

  @property({type: Object})
  routeDetails!: RouteDetails;

  @property({type: String})
  rootPath: string = ROOT_PATH;

  @property({type: Object})
  paginator: EtoolsPaginator = {...defaultPaginator};

  @property({type: Array})
  sort: EtoolsTableSortItem[] = [{name: 'last_login', sort: EtoolsTableColumnSort.Desc}];

  @property({type: Array})
  filters!: EtoolsFilter[];

  @property({type: Object})
  selectedFilters!: FilterKeysAndTheirSelectedValues;

  @property({type: Boolean})
  canAdd = false;

  @property({type: Boolean})
  canExport = false;

  @property({type: String})
  queryParams = '';

  @property({type: String})
  tableCaption = '';

  @property({type: Boolean})
  showLoading = false;

  @property({type: Array})
  listColumns: EtoolsTableColumn[] = [
    {
      label: translate('NAME') as unknown as string,
      name: 'first_name',
      type: EtoolsTableColumnType.Text
    },
    {
      label: translate('POSITION') as unknown as string,
      name: 'position',
      type: EtoolsTableColumnType.Text,
      sort: EtoolsTableColumnSort.Desc
    },
    {
      label: translate('E-MAIL') as unknown as string,
      name: 'email',
      type: EtoolsTableColumnType.Text,
      sort: EtoolsTableColumnSort.Asc
    },
    {
      label: translate('STATUS') as unknown as string,
      name: 'status',
      type: EtoolsTableColumnType.Custom,
      customMethod: (item: any, _key: string) => {
        return html`<span
          ><div class="circle"></div>
          ${item.status}</span
        >`;
      }
    },
    {
      label: translate('LAST_LOGIN') as unknown as string,
      name: 'last_login',
      type: EtoolsTableColumnType.Date
    }
  ];

  @property({type: Array})
  listData: AnyObject[] = [];

  stateChanged(state: RootState) {
    const routeDetails = get(state, 'app.routeDetails');
    if (!(routeDetails.routeName === 'ip-reporting' && routeDetails.subRouteName === 'list')) {
      return; // Avoid code execution while on a different page
    }

    const stateRouteDetails = {...state.app!.routeDetails};

    if (JSON.stringify(stateRouteDetails) !== JSON.stringify(this.routeDetails)) {
      this.routeDetails = stateRouteDetails;

      if (!this.routeDetails.queryParams || Object.keys(this.routeDetails.queryParams).length === 0) {
        this.selectedFilters = {...lastSelectedFilters};
        // update url with params
        this.updateUrlListQueryParams();

        return;
      } else {
        // init selectedFilters, sort, page, page_size from url params
        this.updateListParamsFromRouteDetails(this.routeDetails.queryParams);
        // get list data based on filters, sort and pagination
        this.getListData();
      }
    }

    if (state.user && state.user.permissions) {
      this.canAdd = state.user.permissions.canAdd;
      this.canExport = state.user.permissions.canExport;
    }

    this.initFiltersForDisplay(state);
  }

  initFiltersForDisplay(state: RootState) {
    if (!this.filters && this.dataRequiredByFiltersHasBeenLoaded(state)) {
      const availableFilters = [...defaultFilters];
      this.populateDropdownFilterOptionsFromCommonData(state.commonData, availableFilters);

      // update filter selection and assign the result to etools-filters(trigger render)
      const currentParams: RouteQueryParams = state.app!.routeDetails.queryParams || {};
      this.filters = updateFiltersSelectedValues(currentParams, availableFilters);
    }
  }

  private dataRequiredByFiltersHasBeenLoaded(state: RootState) {
    if (
      state.commonData &&
      get(state, 'commonData.unicefUsers.length') &&
      get(state, 'commonData.partners.length') &&
      this.routeDetails.queryParams &&
      Object.keys(this.routeDetails.queryParams).length > 0
    ) {
      return true;
    }
    return false;
  }

  populateDropdownFilterOptionsFromCommonData(commonData: any, currentFilters: EtoolsFilter[]) {
    updateFilterSelectionOptions(currentFilters, 'unicef_focal_point', commonData.unicefUsers);
    updateFilterSelectionOptions(currentFilters, 'partner', commonData.partners);
  }

  updateUrlListQueryParams() {
    const qs = this.getParamsForQuery();
    this.queryParams = qs;
    replaceAppLocation(`${this.routeDetails.path}?${qs}`, true);
  }

  getParamsForQuery() {
    const params = {
      ...this.selectedFilters,
      page: this.paginator.page,
      page_size: this.paginator.page_size,
      sort: getUrlQueryStringSort(this.sort)
    };
    return buildUrlQueryString(params);
  }

  updateListParamsFromRouteDetails(queryParams: RouteQueryParams) {
    // update sort fields
    if (queryParams.sort) {
      this.sort = getSortFieldsFromUrlSortParams(queryParams.sort);
    }

    // update paginator fields
    const paginatorParams: AnyObject = {};
    if (queryParams.page) {
      paginatorParams.page = Number(queryParams.page);
    }
    if (queryParams.page_size) {
      paginatorParams.page_size = Number(queryParams.page_size);
    }
    this.paginator = {...this.paginator, ...paginatorParams};

    // update selectedFilters
    this.selectedFilters = getSelectedFiltersFromUrlParams(queryParams);
  }

  filtersChange(e: CustomEvent) {
    this.selectedFilters = {...e.detail};
    this.paginator.page = 1;
    this.updateUrlListQueryParams();
  }

  paginatorChange(e: CustomEvent) {
    const newPaginator = {...e.detail};
    this.paginator = newPaginator;
    this.tableCaption = `${this.paginator.visible_range[0]}-${this.paginator.visible_range[1]} of ${this.paginator.count} results to show`;
    this.updateUrlListQueryParams();
  }

  sortChange(e: CustomEvent) {
    this.sort = getSortFields(e.detail);
    this.updateUrlListQueryParams();
  }

  getListData() {
    const endpoint = getEndpoint(etoolsEndpoints.users);
    endpoint.url += `&${buildUrlQueryString(this.paginator)}`;
    sendRequest({
      endpoint: endpoint
    })
      .then((response: any) => {
        // update paginator (total_pages, visible_range, count...)
        this.paginator = getPaginatorWithBackend(this.paginator, response);
        this.listData = [...response.results];
      })
      .catch((err: any) => {
        // TODO: handle req errors
        console.error(err);
      });
  }

  goToAddnewPage() {
    alert('popup to be implemented');
  }

  getChildRowTemplate(item: any): EtoolsTableChildRow {
    const childRow = {} as EtoolsTableChildRow;
    childRow.showExpanded = false;
    childRow.rowHTML = html`
      <td></td>
      <td colspan="5" class="ptb-0">
        <div class="child-row-inner-container">
          <label class="paper-label">${translate('USER_TYPE')}</label><br />
          <label>${getUserTypeLabel(item.user_type || (item.partner ? USER_TYPE.PARTNER : USER_TYPE.IMO))}</label>
          </paper-input>
        </div>
      </td>
    `;
    return childRow;
  }
}
