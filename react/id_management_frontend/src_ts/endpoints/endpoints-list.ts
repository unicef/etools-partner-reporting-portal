export interface EtoolsEndpoint {
  url?: string;
  template?: string;
  exp?: any;
  cachingKey?: string;
  cacheTableName?: string;
}
export interface EtoolsEndpoints {
  [key: string]: EtoolsEndpoint;
}

export const etoolsEndpoints: EtoolsEndpoints = {
  userProfile: {
    url: '/api/account/user-profile/'
  },
  changeCountry: {
    url: '/api/v3/users/changecountry/'
  },
  workspace: {
    url: 'api/core/workspace/'
  },
  users: {
    url: '/api/id-management/users/?portal=IP'
  }
};
