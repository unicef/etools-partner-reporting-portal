export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INVITED: 'INVITED',
  INCOMPLETE: 'INCOMPLETE'
};

export const PRP_ROLE = {
  IP_AUTHORIZED_OFFICER: 'IP_AUTHORIZED_OFFICER',
  IP_EDITOR: 'IP_EDITOR',
  IP_VIEWER: 'IP_VIEWER',
  IP_ADMIN: 'IP_ADMIN'
};

export const USER_TYPE = {
  CLUSTER_ADMIN: 'CLUSTER_ADMIN',
  IMO: 'IMO',
  PARTNER: 'PARTNER'
};

export const USER_TYPE_OPTIONS = [
  {
    label: 'Cluster Admin',
    value: USER_TYPE.CLUSTER_ADMIN
  },
  {
    label: 'IMO',
    value: USER_TYPE.IMO
  },
  {
    label: 'Partner user',
    value: USER_TYPE.PARTNER
  }
];
