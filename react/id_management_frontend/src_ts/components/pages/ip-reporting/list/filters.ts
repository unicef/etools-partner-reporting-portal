import {EtoolsFilter, EtoolsFilterTypes} from '@unicef-polymer/etools-filters/src/etools-filters';
import {setselectedValueTypeByFilterKey} from '@unicef-polymer/etools-filters/src/filters';
import {AnyObject} from '@unicef-polymer/etools-types/dist/global.types';
import {isJsonStrMatch} from '../../../utils/utils';
import {USER_STATUS, PRP_ROLE} from '../../../common/constants';
import {translate} from 'lit-translate';

export enum FilterKeys {
  q = 'q',
  status = 'status',
  roles = 'roles',
  workspaces = 'workspaces',
  page_size = 'page_size',
  sort = 'sort'
}

export type FilterKeysAndTheirSelectedValues = {[key in FilterKeys]?: any};

export const selectedValueTypeByFilterKey: AnyObject = {
  [FilterKeys.q]: 'string',
  [FilterKeys.status]: 'Array',
  [FilterKeys.roles]: 'Array',
  [FilterKeys.workspaces]: 'Array',
  [FilterKeys.page_size]: 'string',
  [FilterKeys.sort]: 'string'
};

setselectedValueTypeByFilterKey(selectedValueTypeByFilterKey);

export const defaultFilters: EtoolsFilter[] = [
  {
    filterName: translate('SEARCH'),
    filterKey: FilterKeys.q,
    type: EtoolsFilterTypes.Search,
    selectedValue: '',
    selected: true
  },
  {
    filterName: translate('WORKSPACE'),
    filterKey: FilterKeys.workspaces,
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
    filterName: translate('STATUS'),
    filterKey: FilterKeys.status,
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
    filterName: translate('ROLE'),
    filterKey: FilterKeys.roles,
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
    hideSearch: false,
    disabled: false,
    optionValue: 'id',
    optionLabel: 'name'
  }
];

export const updateFiltersSelectedValues = (
  selectedFilters: FilterKeysAndTheirSelectedValues,
  filters: EtoolsFilter[]
) => {
  const availableFilters = [...filters];

  for (const fKey in selectedFilters) {
    if (fKey) {
      const selectedValue = selectedFilters[fKey as FilterKeys];
      if (selectedValue) {
        const filter = availableFilters.find((f: EtoolsFilter) => f.filterKey === fKey);
        if (filter) {
          filter.selectedValue = selectedValue instanceof Array ? [...selectedValue] : selectedValue;

          filter.selected = true;
        }
      }
    }
  }

  return availableFilters;
};

export const updateFilterSelectionOptions = (filters: EtoolsFilter[], fKey: string, options: AnyObject[]) => {
  const filter = filters.find((f: EtoolsFilter) => f.filterKey === fKey);
  if (filter && options) {
    if (!isJsonStrMatch(filter.selectionOptions, options)) {
      filter.selectionOptions = [...options];
    }
  }
};
