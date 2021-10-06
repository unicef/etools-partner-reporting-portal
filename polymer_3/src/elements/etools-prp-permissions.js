var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../ReduxConnectedElement';
import UtilsMixin from '../mixins/utils-mixin';
import Constants from '../constants';
import { property } from '@polymer/decorators';
(function () {
    const checkInResponsePlan = (roles) => {
        return function (params) {
            return (params.prpRoles || []).filter(function (role) {
                return params.responsePlan && params.responsePlan.clusters && params.responsePlan.clusters.some(function (cluster) {
                    return role.cluster && cluster.id === role.cluster.id;
                });
            }).some(function (item) {
                return roles.indexOf(item.role) > -1;
            });
        };
    };
    const createClusterEntitiesUsers = [
        Constants.PRP_ROLE.CLUSTER_IMO,
        Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN
    ];
    const permissions = {
        editProgressReport: [
            Constants.PRP_ROLE.IP_AUTHORIZED_OFFICER,
            Constants.PRP_ROLE.IP_EDITOR,
            Constants.PRP_ROLE.IP_ADMIN,
        ],
        exportSubmittedProgressReport: [
            Constants.PRP_ROLE.IP_AUTHORIZED_OFFICER,
            Constants.PRP_ROLE.IP_EDITOR,
        ],
        savePdReport: [
            Constants.PRP_ROLE.IP_AUTHORIZED_OFFICER,
            Constants.PRP_ROLE.IP_EDITOR,
            Constants.PRP_ROLE.IP_ADMIN,
        ],
        changeProgrammeDocumentCalculationMethod: [
            Constants.PRP_ROLE.IP_AUTHORIZED_OFFICER,
            Constants.PRP_ROLE.IP_EDITOR,
        ],
        createClusterEntities: checkInResponsePlan(createClusterEntitiesUsers),
        createClusterEntitiesForCluster: function (params, clusterId) {
            return params.prpRoles.some(function (item) {
                return String(clusterId) === String(item.cluster.id) &&
                    createClusterEntitiesUsers.indexOf(item.role) > -1;
            });
        },
        submitIndicatorReport: function (params, report) {
            const allowedRoles = [
                Constants.PRP_ROLE.CLUSTER_IMO,
                Constants.PRP_ROLE.CLUSTER_MEMBER,
                Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN,
                Constants.PRP_ROLE.CLUSTER_COORDINATOR,
            ];
            return params.prpRoles.some(function (item) {
                return allowedRoles.indexOf(item.role) > -1 &&
                    (item.role === Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN ||
                        ((Constants.PARTNER_ROLES.indexOf(item.role) > -1 ?
                            report.partner_id === (params.partner && params.partner.id) :
                            String(item.cluster.id) === String(report.cluster_id)) &&
                            (item.role === Constants.PRP_ROLE.CLUSTER_COORDINATOR ?
                                !report.cluster_activity : true)));
            });
        },
        editIndicatorReport: function (params, report) {
            const allowedRoles = [
                Constants.PRP_ROLE.CLUSTER_IMO,
                Constants.PRP_ROLE.CLUSTER_MEMBER,
                Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN
            ];
            return (params.prpRoles || []).filter(function (role) {
                return params.responsePlan && params.responsePlan.clusters.some(function (cluster) {
                    return role.cluster && cluster.id === role.cluster.id;
                });
            }).some(function (item) {
                return allowedRoles.indexOf(item.role) > -1 &&
                    (item.role === Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN ||
                        (Constants.PARTNER_ROLES.indexOf(item.role) > -1 ?
                            report.partner_id === (params.partner && params.partner.id) :
                            String(item.cluster.id) === String(report.cluster_id)));
            });
        },
        sendBackIndicatorReport: [
            Constants.PRP_ROLE.CLUSTER_IMO,
            Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN,
        ],
        createPartnerEntities: [
            Constants.PRP_ROLE.CLUSTER_MEMBER,
            Constants.PRP_ROLE.CLUSTER_IMO,
            Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN,
        ],
        createPartnerEntitiesByResponsePlan: function (params, responsePlanClusters) {
            const allowedRoles = [
                Constants.PRP_ROLE.CLUSTER_IMO,
                Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN,
            ];
            return responsePlanClusters.some(function (cluster) {
                return params.prpRoles.some(function (item) {
                    if (item.cluster === null) {
                        return item.role === Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN;
                    }
                    else {
                        return item.role === Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN ||
                            (String(item.cluster.id) === String(cluster.id) &&
                                allowedRoles.indexOf(item.role) > -1);
                    }
                });
            });
        },
        editPartnerEntities: function (params, entityClusters) {
            const allowedRoles = permissions.createPartnerEntities;
            return entityClusters.some(function (cluster) {
                return params.prpRoles.some(function (item) {
                    if (item.cluster === null) {
                        return item.role === Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN;
                    }
                    else {
                        return item.role === Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN ||
                            (String(item.cluster.id) === String(cluster.id) &&
                                allowedRoles.indexOf(item.role) > -1);
                    }
                });
            });
        },
        viewPlannedAction: function (params) {
            const allowedRoles = [
                Constants.PRP_ROLE.CLUSTER_MEMBER,
                Constants.PRP_ROLE.CLUSTER_VIEWER
            ];
            return params.partner && params.partner.id && (params.prpRoles || []).some(function (item) {
                return allowedRoles.indexOf(item.role) > -1;
            });
        },
        addPlannedActionProject: [
            Constants.PRP_ROLE.CLUSTER_MEMBER,
        ],
        editPlannedActionEntities: [
            Constants.PRP_ROLE.CLUSTER_MEMBER,
        ],
        createPartnerProject: [
            Constants.PRP_ROLE.CLUSTER_MEMBER,
            Constants.PRP_ROLE.CLUSTER_IMO,
            Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN,
        ],
        adminResponsePlan: [
            Constants.PRP_ROLE.CLUSTER_IMO,
            Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN,
        ],
        addPartnerToProject: checkInResponsePlan([
            Constants.PRP_ROLE.CLUSTER_IMO,
            Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN,
        ]),
        createPartnerEntitiesAsImo: [
            Constants.PRP_ROLE.CLUSTER_IMO,
            Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN,
        ],
        addPartnerToActivity: [
            Constants.PRP_ROLE.CLUSTER_IMO,
            Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN,
        ],
        editIndicatorDetails: [
            Constants.PRP_ROLE.CLUSTER_IMO,
            Constants.PRP_ROLE.CLUSTER_MEMBER,
            Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN,
        ],
        onlyEditOwnIndicatorDetails: [
            Constants.PRP_ROLE.CLUSTER_MEMBER,
            Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN
        ],
        editIndicatorLocations: [
            Constants.PRP_ROLE.CLUSTER_IMO,
            Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN,
        ],
        accessIpIdManagement: [
            Constants.PRP_ROLE.IP_AUTHORIZED_OFFICER,
            Constants.PRP_ROLE.IP_ADMIN
        ],
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
        _computePermissions(params) {
            return Object.keys(permissions).reduce(function (acc, key) {
                const granted = permissions[key];
                acc[key] = (function () {
                    switch (true) {
                        case Array.isArray(granted):
                            return (params.prpRoles || []).some(function (role) {
                                return granted.indexOf(role.role) > -1 &&
                                    (Constants.WORKSPACE_ROLES.indexOf(role.role) > -1 ?
                                        (role.workspace &&
                                            role.workspace.workspace_code === params.workspace) : true);
                            });
                        case typeof granted === 'function':
                            if (granted.length > 1) {
                                return function () {
                                    const args = [].slice.call(arguments);
                                    return granted.apply(null, [params].concat(args));
                                };
                            }
                            return granted(params);
                        case granted === Constants.PRP_ROLE.ALL:
                            return true;
                        default:
                            return false;
                    }
                }());
                return acc;
            }, {});
        }
        _computePrpRoles(profile) {
            return profile.prp_roles || [];
        }
        _computeImoClusters(profile) {
            return profile.prp_roles ?
                profile.prp_roles.filter(function (item) {
                    return item.role === Constants.PRP_ROLE.CLUSTER_IMO;
                })
                    .map(function (item) {
                    return item.cluster;
                }) : [];
        }
        _computeParams(prpRoles, imoClusters, partner, workspace, responsePlan) {
            return {
                prpRoles: prpRoles,
                imoClusters: imoClusters,
                partner: partner,
                workspace: workspace,
                responsePlan: responsePlan
            };
        }
    }
    __decorate([
        property({ type: Object, computed: 'getReduxStateObject(rootState.userProfile.profile)' })
    ], EtoolsPrpPermissions.prototype, "profile", void 0);
    __decorate([
        property({ type: Array, computed: '_computePrpRoles(profile)' })
    ], EtoolsPrpPermissions.prototype, "prpRoles", void 0);
    __decorate([
        property({ type: Array, computed: '_computeImoClusters(profile)' })
    ], EtoolsPrpPermissions.prototype, "imoClusters", void 0);
    __decorate([
        property({ type: Object, computed: 'getReduxStateObject(rootState.partner.current)' })
    ], EtoolsPrpPermissions.prototype, "partner", void 0);
    __decorate([
        property({ type: String, computed: 'getReduxStateValue(rootState.workspaces.current)' })
    ], EtoolsPrpPermissions.prototype, "workspace", void 0);
    __decorate([
        property({ type: Object, computed: 'getReduxStateObject(rootState.responsePlans.current)' })
    ], EtoolsPrpPermissions.prototype, "responsePlan", void 0);
    __decorate([
        property({ type: Object, computed: '_computeParams(prpRoles, imoClusters, partner, workspace, responsePlan)' })
    ], EtoolsPrpPermissions.prototype, "params", void 0);
    __decorate([
        property({ type: Object, computed: '_computePermissions(params)', notify: true })
    ], EtoolsPrpPermissions.prototype, "permissions", void 0);
    window.customElements.define('etools-prp-permissions', EtoolsPrpPermissions);
}());
