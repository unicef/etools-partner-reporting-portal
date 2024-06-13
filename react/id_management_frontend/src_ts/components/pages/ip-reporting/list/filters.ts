import {EtoolsFilterTypes} from '@unicef-polymer/etools-filters/src/etools-filters';
import {FiltersHelper} from '@unicef-polymer/etools-filters/src/filters-helper.class';
import {AnyObject} from '@unicef-polymer/etools-types/dist/global.types';
import {USER_STATUS, PRP_ROLE} from '../../../common/constants';
import {get as getTranslation} from 'lit-translate';

export enum IPReportingFilterKeys {
  q = 'q',
  status = 'status',
  roles = 'roles',
  workspaces = 'workspaces',
  page_size = 'page_size',
  sort = 'sort'
}

export type FilterKeysAndTheirSelectedValues = {[key in IPReportingFilterKeys]?: any};

export const selectedValueTypeByFilterKey: AnyObject = {
  [IPReportingFilterKeys.q]: 'string',
  [IPReportingFilterKeys.status]: 'Array',
  [IPReportingFilterKeys.roles]: 'Array',
  [IPReportingFilterKeys.workspaces]: 'Array',
  [IPReportingFilterKeys.page_size]: 'string',
  [IPReportingFilterKeys.sort]: 'string'
};

export const IpReportingFiltersHelper = new FiltersHelper(selectedValueTypeByFilterKey);

export function getIpReportingFilters() {
  return [
    {
      filterName: getTranslation('SEARCH'),
      filterKey: IPReportingFilterKeys.q,
      type: EtoolsFilterTypes.Search,
      selectedValue: '',
      selected: true
    },
    {
      filterName: getTranslation('WORKSPACE'),
      filterKey: IPReportingFilterKeys.workspaces,
      type: EtoolsFilterTypes.DropdownMulti,
      selectionOptions: [],
      selectedValue: [],
      selected: true,
      minWidth: '350px',
      hideSearch: false,
      disabled: false,
      optionValue: 'id',
      optionLabel: 'name'
    },
    {
      filterName: getTranslation('STATUS'),
      filterKey: IPReportingFilterKeys.status,
      type: EtoolsFilterTypes.DropdownMulti,
      selectionOptions: [
        {
          id: USER_STATUS.ACTIVE,
          name: 'Active'
        },
        {
          id: USER_STATUS.INVITED,
          name: 'Invited'
        },
        {
          id: USER_STATUS.INCOMPLETE,
          name: 'Inactive'
        }
      ],
      optionValue: 'id',
      optionLabel: 'name',
      selectedValue: [],
      selected: true,
      minWidth: '350px',
      hideSearch: true,
      disabled: false
    },
    {
      filterName: getTranslation('ROLE'),
      filterKey: IPReportingFilterKeys.roles,
      type: EtoolsFilterTypes.DropdownMulti,
      selectionOptions: [
        {
          id: PRP_ROLE.IP_AUTHORIZED_OFFICER,
          name: 'IP Authorized officer'
        },
        {
          id: PRP_ROLE.IP_EDITOR,
          name: 'IP Editor'
        },
        {
          id: PRP_ROLE.IP_VIEWER,
          name: 'IP Viewer'
        },
        {
          id: PRP_ROLE.IP_ADMIN,
          name: 'IP Admin'
        }
      ],
      selectedValue: [],
      selected: true,
      minWidth: '350px',
      hideSearch: true,
      disabled: false,
      optionValue: 'id',
      optionLabel: 'name'
    }
  ];
}
