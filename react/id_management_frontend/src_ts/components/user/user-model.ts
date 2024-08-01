import {AnyObject} from '@unicef-polymer/etools-types';

// TODO: improve this user model
export interface EtoolsUserModel {
  countries_available: AnyObject[];
  groups: AnyObject[];
  country: AnyObject;
  country_override: number;
  email: string;
  first_name: string;
  guid: string;
  is_active: string;
  is_staff: string;
  is_superuser: string;
  job_title: string;
  last_login: string;
  last_name: string;
  middle_name: string;
  name: string;
  office: string | null;
  oic: any;
  user: number;
  username: string;
  vendor_number: string | null;
  [key: string]: any;
}

export const dummyUserData = {
  countries_available: [
    {
      business_area_code: '4590',
      id: 46,
      name: 'Burkina Faso'
    },
    {
      business_area_code: '0060',
      id: 24,
      name: 'Afghanistan'
    },
    {
      business_area_code: '2130',
      id: 13,
      name: 'Iraq'
    },
    {
      business_area_code: '2490',
      id: 9,
      name: 'Lebanon'
    }
  ],
  groups: [
    {
      id: 6,
      name: 'UNICEF User',
      permissions: [60, 324, 287, 288, 289]
    }
  ],
  country: {
    id: 9,
    initial_zoom: 8,
    latitude: '33.85000',
    local_currency: 'US Dollar',
    longitude: '35.86000',
    name: 'Lebanon'
  },
  country_override: 9,
  email: 'jane@demo.com',
  first_name: 'Jane',
  guid: '',
  is_active: 'True',
  is_staff: 'True',
  is_superuser: 'True',
  job_title: '',
  last_login: '2020-04-01 09:55:21.303242+00:00',
  last_name: 'Doe',
  middle_name: '',
  name: 'Test User',
  office: '',
  oic: 'oic',
  user: 255577,
  username: 'jane@unicef.org',
  vendor_number: ''
};
