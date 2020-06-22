import {ReduxConnectedElement} from '../ReduxConnectedElement';
import UtilsMixin from '../mixins/utils-mixin';
import Constants from '../constants';
import {property} from '@polymer/decorators';
import {GenericObject} from '../typings/globals.types';

(function () {
  const checkInResponsePlan = (roles: any[]) => {
    return function (params: GenericObject) {
      return (params.prpRoles || [])
        .filter(function (role: any) {
          return (
            params.responsePlan &&
            params.responsePlan.clusters &&
            params.responsePlan.clusters.some(function (cluster: any) {
              return role.cluster && cluster.id === role.cluster.id;
            })
          );
        })
        .some(function (item: any) {
          return roles.indexOf(item.role) > -1;
        });
    };
  };

  const createClusterEntitiesUsers = [Constants.PRP_ROLE.CLUSTER_IMO, Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN];

  const permissions = {
    editProgressReport: [
      Constants.PRP_ROLE.IP_AUTHORIZED_OFFICER,
      Constants.PRP_ROLE.IP_EDITOR,
      Constants.PRP_ROLE.IP_ADMIN
    ],

    exportSubmittedProgressReport: [Constants.PRP_ROLE.IP_AUTHORIZED_OFFICER, Constants.PRP_ROLE.IP_EDITOR],

    savePdReport: [Constants.PRP_ROLE.IP_AUTHORIZED_OFFICER, Constants.PRP_ROLE.IP_EDITOR, Constants.PRP_ROLE.IP_ADMIN],

    changeProgrammeDocumentCalculationMethod: [Constants.PRP_ROLE.IP_AUTHORIZED_OFFICER, Constants.PRP_ROLE.IP_EDITOR],

    createClusterEntities: checkInResponsePlan(createClusterEntitiesUsers),

    createClusterEntitiesForCluster: function (params: GenericObject, clusterId: any) {
      return params.prpRoles.some(function (item: any) {
        return String(clusterId) === String(item.cluster.id) && createClusterEntitiesUsers.indexOf(item.role) > -1;
      });
    },

    submitIndicatorReport: function (params: GenericObject, report: GenericObject) {
      const allowedRoles = [
        Constants.PRP_ROLE.CLUSTER_IMO,
        Constants.PRP_ROLE.CLUSTER_MEMBER,
        Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN,
        Constants.PRP_ROLE.CLUSTER_COORDINATOR
      ];

      return params.prpRoles.some(function (item: any) {
        return (
          allowedRoles.indexOf(item.role) > -1 &&
          (item.role === Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN ||
            ((Constants.PARTNER_ROLES.indexOf(item.role) > -1
              ? report.partner_id === (params.partner && params.partner.id)
              : String(item.cluster ? item.cluster.id : '') === String(report.cluster_id)) &&
              (item.role === Constants.PRP_ROLE.CLUSTER_COORDINATOR ? !report.cluster_activity : true)))
        );
      });
    },

    editIndicatorReport: function (params: GenericObject, report: GenericObject) {
      const allowedRoles = [
        Constants.PRP_ROLE.CLUSTER_IMO,
        Constants.PRP_ROLE.CLUSTER_MEMBER,
        Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN
      ];

      return (params.prpRoles || [])
        .filter(function (role: any) {
          return (
            params.responsePlan &&
            params.responsePlan.clusters.some(function (cluster: any) {
              return role.cluster && cluster.id === role.cluster.id;
            })
          );
        })
        .some(function (item: any) {
          return (
            allowedRoles.indexOf(item.role) > -1 &&
            (item.role === Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN ||
              (Constants.PARTNER_ROLES.indexOf(item.role) > -1
                ? report.partner_id === (params.partner && params.partner.id)
                : String(item.cluster.id) === String(report.cluster_id)))
          );
        });
    },

    sendBackIndicatorReport: [Constants.PRP_ROLE.CLUSTER_IMO, Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN],

    createPartnerEntities: [
      Constants.PRP_ROLE.CLUSTER_MEMBER,
      Constants.PRP_ROLE.CLUSTER_IMO,
      Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN
    ],

    createPartnerEntitiesByResponsePlan: function (params: GenericObject, responsePlanClusters: any[]) {
      const allowedRoles = [Constants.PRP_ROLE.CLUSTER_IMO, Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN];

      return responsePlanClusters.some(function (cluster: any) {
        return params.prpRoles.some(function (item: any) {
          if (item.cluster === null) {
            return item.role === Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN;
          } else {
            return (
              item.role === Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN ||
              (String(item.cluster.id) === String(cluster.id) && allowedRoles.indexOf(item.role) > -1)
            );
          }
        });
      });
    },

    editPartnerEntities: function (params: GenericObject, entityClusters: any[]) {
      const allowedRoles = permissions.createPartnerEntities;

      return entityClusters.some(function (cluster) {
        return params.prpRoles.some(function (item: any) {
          if (item.cluster === null) {
            return item.role === Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN;
          } else {
            return (
              item.role === Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN ||
              (String(item.cluster.id) === String(cluster.id) && allowedRoles.indexOf(item.role) > -1)
            );
          }
        });
      });
    },

    viewPlannedAction: function (params: GenericObject) {
      const allowedRoles = [Constants.PRP_ROLE.CLUSTER_MEMBER, Constants.PRP_ROLE.CLUSTER_VIEWER];

      return (
        params.partner &&
        params.partner.id &&
        (params.prpRoles || []).some(function (item: any) {
          return allowedRoles.indexOf(item.role) > -1;
        })
      );
    },

    addPlannedActionProject: [Constants.PRP_ROLE.CLUSTER_MEMBER],

    editPlannedActionEntities: [Constants.PRP_ROLE.CLUSTER_MEMBER],

    createPartnerProject: [
      Constants.PRP_ROLE.CLUSTER_MEMBER,
      Constants.PRP_ROLE.CLUSTER_IMO,
      Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN
    ],

    adminResponsePlan: [Constants.PRP_ROLE.CLUSTER_IMO, Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN],

    addPartnerToProject: checkInResponsePlan([Constants.PRP_ROLE.CLUSTER_IMO, Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN]),

    createPartnerEntitiesAsImo: [Constants.PRP_ROLE.CLUSTER_IMO, Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN],

    addPartnerToActivity: [Constants.PRP_ROLE.CLUSTER_IMO, Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN],

    editIndicatorDetails: [
      Constants.PRP_ROLE.CLUSTER_IMO,
      Constants.PRP_ROLE.CLUSTER_MEMBER,
      Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN
    ],

    onlyEditOwnIndicatorDetails: [Constants.PRP_ROLE.CLUSTER_MEMBER, Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN],

    editIndicatorLocations: [Constants.PRP_ROLE.CLUSTER_IMO, Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN],

    accessIpIdManagement: [Constants.PRP_ROLE.IP_AUTHORIZED_OFFICER, Constants.PRP_ROLE.IP_ADMIN],

    accessClusterIdManagement: [
      Constants.PRP_ROLE.CLUSTER_MEMBER,
      Constants.PRP_ROLE.CLUSTER_IMO,
      Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN
    ]
  };

  /**
   * @polymer
   * @customElement
   * @appliesMixin UtilsMixin
   */
  class EtoolsPrpPermissions extends UtilsMixin(ReduxConnectedElement) {
    @property({type: Object, computed: 'getReduxStateObject(rootState.userProfile.profile)'})
    profile!: GenericObject;

    @property({type: Array, computed: '_computePrpRoles(profile)'})
    prpRoles!: any[];

    @property({type: Array, computed: '_computeImoClusters(profile)'})
    imoClusters!: any[];

    @property({type: Object, computed: 'getReduxStateObject(rootState.partner.current)'})
    partner!: GenericObject;

    @property({type: String, computed: 'getReduxStateValue(rootState.workspaces.current)'})
    workspace!: string;

    @property({type: Object, computed: 'getReduxStateObject(rootState.responsePlans.current)'})
    responsePlan!: GenericObject;

    @property({type: Object, computed: '_computeParams(prpRoles, imoClusters, partner, workspace, responsePlan)'})
    params!: GenericObject;

    @property({type: Object, computed: '_computePermissions(params)', notify: true})
    permissions!: GenericObject;

    _computePermissions(params: GenericObject) {
      return Object.keys(permissions).reduce(function (acc: any, key: string) {
        const granted = permissions[key];
        acc[key] = (function () {
          switch (true) {
            case Array.isArray(granted):
              return (params.prpRoles || []).some(function (role: any) {
                return (
                  granted.indexOf(role.role) > -1 &&
                  (Constants.WORKSPACE_ROLES.indexOf(role.role) > -1
                    ? role.workspace && role.workspace.workspace_code === params.workspace
                    : true)
                );
              });

            case typeof granted === 'function':
              if (granted.length > 1) {
                return function (...args: any[]) {
                  const arg = [].slice.call(args);
                  return granted(...[params].concat(arg));
                };
              }

              return granted(params);

            case granted === Constants.PRP_ROLE.ALL:
              return true;

            default:
              return false;
          }
        })();

        return acc;
      }, {});
    }

    _computePrpRoles(profile: GenericObject) {
      return profile.prp_roles || [];
    }

    _computeImoClusters(profile: GenericObject) {
      return profile.prp_roles
        ? profile.prp_roles
            .filter(function (item: any) {
              return item.role === Constants.PRP_ROLE.CLUSTER_IMO;
            })
            .map(function (item: any) {
              return item.cluster;
            })
        : [];
    }

    _computeParams(
      prpRoles: any[],
      imoClusters: any[],
      partner: GenericObject,
      workspace: string,
      responsePlan: GenericObject
    ) {
      return {
        prpRoles: prpRoles,
        imoClusters: imoClusters,
        partner: partner,
        workspace: workspace,
        responsePlan: responsePlan
      };
    }
  }
  window.customElements.define('etools-prp-permissions', EtoolsPrpPermissions);
})();
