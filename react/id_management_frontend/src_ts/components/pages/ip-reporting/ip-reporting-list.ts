import '@polymer/paper-button/paper-button';
import {customElement, html, LitElement, property} from 'lit-element';
import {connect} from 'pwa-helpers/connect-mixin';
import {translate} from 'lit-translate';
import {RootState, store} from '../../../redux/store';

import '../../common/layout/page-content-header/page-content-header';
// eslint-disable-next-line max-len
import {pageContentHeaderSlottedStyles} from '../../common/layout/page-content-header/page-content-header-slotted-styles';

import '@unicef-polymer/etools-filters/src/etools-filters';
import {getIpReportingFilters, IpReportingFiltersHelper} from './list/filters';
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
import {buildUrlQueryString, cloneDeep} from '@unicef-polymer/etools-modules-common/dist/utils/utils';
import {RouteDetails, RouteQueryParams} from '../../../routing/router';
import {replaceAppLocation} from '../../../routing/routes';
import {SharedStylesLit} from '../../styles/shared-styles-lit';

import '@unicef-polymer/etools-loading';
import get from 'lodash-es/get';
import {etoolsEndpoints} from '../../../endpoints/endpoints-list';
import {getEndpoint} from '../../../endpoints/endpoints';
import {sendRequest} from '@unicef-polymer/etools-ajax';
import {USER_TYPE} from '../../common/constants';
import {getUserTypeLabel} from '../../utils/utils';
import {TableStyles} from './list/table-styles';
import {pick} from 'lodash-es';
import {GenericObject} from '@unicef-polymer/etools-types';

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
            <paper-button id="addBtn" class="primary left-icon" raised>
              <iron-icon icon="add"></iron-icon><span>NEW</span>
            </paper-button>
          </div>
        </div>
      </page-content-header>

      <section class="elevation page-content filters" elevation="1">
        <etools-loading loading-text="Loading..." .active="${this.showFiltersLoading}"></etools-loading>
        <etools-filters
          .filters="${this.filters}"
          @filter-change="${this.filtersChange}"
          .textFilters="${translate('FILTERS')}"
          .textClearAll="${translate('CLEAR_ALL')}"
        ></etools-filters>
      </section>

      <section class="elevation page-content no-padding" elevation="1">
        <etools-loading loading-text="Loading..." .active="${this.showListLoading}"></etools-loading>
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
  filters!: EtoolsFilter[];

  @property({type: Boolean})
  canExport = false;

  @property({type: String})
  queryParams = '';

  @property({type: String})
  tableCaption = '';

  @property({type: Boolean})
  showListLoading = false;

  @property({type: Boolean})
  showFiltersLoading = false;

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
          ><div class="circle ${item.status}"></div>
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
  listData: GenericObject[] = [];

  @property({type: Object})
  prevQueryStringObj: GenericObject = {page_size: 10, sort: 'last_login.desc'};

  private paramsInitialized = false;

  stateChanged(state: RootState) {
    const routeDetails = get(state, 'app.routeDetails');
    if (!(routeDetails.routeName === 'ip-reporting' && routeDetails.subRouteName === 'list')) {
      return; // Avoid code execution while on a different page
    }

    const stateRouteDetails = {...state.app!.routeDetails};

    if (JSON.stringify(stateRouteDetails) !== JSON.stringify(this.routeDetails)) {
      if (
        (!stateRouteDetails.queryParams || Object.keys(stateRouteDetails.queryParams).length === 0) &&
        this.prevQueryStringObj
      ) {
        this.routeDetails = stateRouteDetails;
        this.updateCurrentParams(this.prevQueryStringObj);
        return;
      }

      this.onParamsChange(stateRouteDetails, false);
    }

    this.initFiltersForDisplay(state);
  }

  onParamsChange(routeDetails: RouteDetails, _forceReGet: boolean): void {
    this.routeDetails = routeDetails;
    const currentParams: GenericObject<any> = this.routeDetails?.queryParams || {};
    const paramsValid: boolean = this.paramsInitialized || this.initializeAndValidateParams(currentParams);

    if (paramsValid) {
      // get data as params are valid
      this.showListLoading = true;
      this.getListData();
    }
  }

  private initializeAndValidateParams(currentParams: GenericObject<any>): boolean {
    this.paramsInitialized = true;

    // update sort in listColumns
    const [field, direction] = (currentParams.sort || '').split('.');
    if (field && direction) {
      this.listColumns = this.listColumns.map((column: EtoolsTableColumn) => {
        if (column.name !== field) {
          return column;
        } else {
          return {
            ...column,
            sort: direction as EtoolsTableColumnSort
          };
        }
      });
    }

    // set required params in url
    if (!currentParams.page_size) {
      // prevQueryStringObj store page previous filtering params, if set, apply them to preserve user filters selection
      this.updateCurrentParams(
        this.prevQueryStringObj
          ? this.prevQueryStringObj
          : {
              page_size: '20',
              status: ['draft', 'active', 'review', 'signed', 'signature']
            }
      );
      return false;
    } else {
      // store existing url params in prevQueryStringObj property, to be used on navigation to PD list as default params
      this.prevQueryStringObj = currentParams;
      return true;
    }
  }

  initFiltersForDisplay(state: RootState) {
    if (!this.filters && this.dataRequiredByFiltersHasBeenLoaded(state)) {
      const availableFilters = JSON.parse(JSON.stringify(getIpReportingFilters()));
      // this.populateDropdownFilterOptionsFromCommonData(state availableFilters);
      const currentParams: RouteQueryParams = state.app!.routeDetails.queryParams || {};
      this.filters = IpReportingFiltersHelper.updateFiltersSelectedValues(currentParams, availableFilters);
    }
  }

  hadToinitializeUrlWithPrevQueryString(stateRouteDetails: any) {
    if (
      (!stateRouteDetails.queryParams || Object.keys(stateRouteDetails.queryParams).length === 0) &&
      this.prevQueryStringObj
    ) {
      this.updateCurrentParams(this.prevQueryStringObj);
      return true;
    }
    return false;
  }

  private updateCurrentParams(paramsToUpdate: GenericObject<any>, reset = false): void {
    let currentParams = this.routeDetails ? this.routeDetails.queryParams : this.prevQueryStringObj;
    if (reset) {
      currentParams = pick(currentParams, ['sort', 'size', 'page']);
    }
    const newParams = cloneDeep({...currentParams, ...paramsToUpdate});
    this.prevQueryStringObj = newParams;
    const stringParams: string = buildUrlQueryString(this.prevQueryStringObj);
    // replaceAppLocation(`${this.routeDetails.path}?${stringParams}`, true);
    replaceAppLocation(`ip-reporting/list?${stringParams}`);
  }

  initializePaginatorFromUrl(queryParams: any) {
    if (queryParams.page) {
      this.paginator.page = Number(queryParams.page);
    } else {
      this.paginator.page = 1;
    }

    if (queryParams.size) {
      this.paginator.page_size = Number(queryParams.size);
    }
  }

  private dataRequiredByFiltersHasBeenLoaded(state: RootState) {
    if (state.user) {
      return true;
    }
    return false;
  }

  populateDropdownFilterOptionsFromCommonData(_commonData: any, _currentFilters: EtoolsFilter[]) {
    // updateFilterSelectionOptions(currentFilters, 'unicef_focal_point', commonData.unicefUsers);
    // updateFilterSelectionOptions(currentFilters, 'partner', commonData.partners);
  }

  filtersChange(e: CustomEvent) {
    this.updateCurrentParams({...e.detail, page: 1}, true);
  }

  paginatorChange(e: CustomEvent) {
    const {page, page_size}: EtoolsPaginator = e.detail;
    this.updateCurrentParams({page, page_size});
  }

  sortChange(e: CustomEvent) {
    // this.sort = getSortFields(e.detail);
    const sort = e.detail.field + '.' + e.detail.direction;
    this.updateCurrentParams({sort: sort});
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
      })
      .then(() => {
        this.showListLoading = false;
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
