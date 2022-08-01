import PropTypes from 'prop-types'
import React, {Component} from "react";
import PageHeader from "../common/PageHeader";
import ButtonNew from "../common/ButtonNew";
import PageContent from "../common/PageContent";
import UsersFilter from "./UsersFilter";
import UsersList from "./UsersList";
import {api} from "../../infrastructure/api";
import {fullName} from "../../helpers/filters";
import AddUserDialog from "./AddUserDialog";
import withDialogHandling from "../hoc/withDialogHandling";
import AddPermissionsDialog from "./AddPermissionsDialog";
import EditPermissionDialog from "./EditPermissionDialog";
import ConfirmDialog from "../common/ConfirmDialog";
import withSearch from "../hoc/withSearch";
import {PRP_ROLE, USER_STATUS, USER_TYPE} from "../../constants";
import withProps from "../hoc/withProps";
import {portal, user} from "../../helpers/props";
import {hasAnyRole} from "../../helpers/user";
import AoAlert from "./AoAlert";
import {fetch, FETCH_OPTIONS, fetchInvalidate} from "../../fetch";
import {connect} from "react-redux";
import {PORTALS} from "../../actions";

const header = "Users";
const CONFIRM_ACTIONS = {
    DELETE_PERMISSION: "DELETE_PERMISSION",
    MAKE_IP_ADMIN: "MAKE_IP_ADMIN",
    REMOVE_IP_ADMIN: "REMOVE_IP_ADMIN",
    MAKE_CLUSTER_ADMIN: "MAKE_CLUSTER_ADMIN",
    DEACTIVATE_AO: "DEACTIVATE_AO",
    ACTIVATE_AO: "ACTIVATE_AO"
};
const confirmMessages = {
    [CONFIRM_ACTIONS.DELETE_PERMISSION]: "Are you sure you want to remove this role for this user?",
    [CONFIRM_ACTIONS.MAKE_IP_ADMIN]: "Are you sure you want to make this user an IP Admin in this workspace?",
    [CONFIRM_ACTIONS.REMOVE_IP_ADMIN]: "Are you sure you want to remove IP Admin role for this user in this workspace?",
    [CONFIRM_ACTIONS.MAKE_CLUSTER_ADMIN]: "Are you sure you want to make this user an Cluster Admin?",
    [CONFIRM_ACTIONS.DEACTIVATE_AO]: "Are you sure you want to deactivate IP Authorized Officer role for this user in this workspace?",
    [CONFIRM_ACTIONS.ACTIVATE_AO]: "Are you sure you want to activate IP Authorized Officer role for this user in this workspace?",
};

class Users extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedUser: null,
            selectedPermission: null,
            addUserDialogOpen: false,
            action: CONFIRM_ACTIONS.DELETE_PERMISSION,
            filterValues: props.getQuery(),
            isAo: hasAnyRole(props.user, [PRP_ROLE.IP_AUTHORIZED_OFFICER]),
        };

        this.listEventListeners = {
            onPermissionsAdd: this.openAddPermissionsDialog.bind(this),
            onPermissionEdit: this.openEditPermissionsDialog.bind(this),
            onPermissionDelete: this.openConfirmDialog(CONFIRM_ACTIONS.DELETE_PERMISSION),
            onRemoveIpAdmin: this.openConfirmDialog(CONFIRM_ACTIONS.REMOVE_IP_ADMIN),
            onMakeIpAdmin: this.openConfirmDialog(CONFIRM_ACTIONS.MAKE_IP_ADMIN),
            onMakeSystemAdmin: this.openConfirmDialog(CONFIRM_ACTIONS.MAKE_CLUSTER_ADMIN),
            onDeactivateAo: this.openConfirmDialog(CONFIRM_ACTIONS.DEACTIVATE_AO),
            onActivateAo: this.openConfirmDialog(CONFIRM_ACTIONS.ACTIVATE_AO)
        };

        this.onUserSave = this.onUserSave.bind(this);
        this.onConfirm = this.onConfirm.bind(this);
        this.closeAndReload = this.closeAndReload.bind(this);
        this.setAoFilter = this.setAoFilter.bind(this);
        this.onFilterReset = this.onFilterReset.bind(this);

        if (this.state.isAo && props.portal === PORTALS.IP) {
            props.fetchOtherAo();
        }
    }

    onUserSave(user) {
        const {reload} = this.props;

        reload();

        if (user.user_type !== USER_TYPE.CLUSTER_ADMIN) {
            this.openAddPermissionsDialog(user);
        }
    }

    openAddPermissionsDialog(user) {
        this.setState({selectedUser: user});
        this.props.handleDialogOpen("addPermissions");
    }

    openEditPermissionsDialog(user, permission) {
        this.setState({selectedUser: user, selectedPermission: permission});
        this.props.handleDialogOpen("editPermission");
    }

    openConfirmDialog(action) {
        return (item) => {
            switch (action) {
                case CONFIRM_ACTIONS.MAKE_CLUSTER_ADMIN:
                    this.setState({action, selectedUser: item});
                    break;
                default:
                    this.setState({action, selectedPermission: item});
                    break;
            }
            this.props.handleDialogOpen("confirm");
        }
    }

    closeAndReload() {
        const {reload, handleDialogClose} = this.props;

        handleDialogClose();
        reload();
    }

    deletePermission(permission) {
        api.delete(`id-management/role-group/${permission.id}/`)
            .then(this.closeAndReload);
    }

    makeIpAdmin(permission) {
        api.patch(`id-management/role-group/${permission.id}/`, {role: PRP_ROLE.IP_ADMIN})
            .then(this.closeAndReload)
    }

    makeClusterAdmin(user) {
        api.post(`id-management/role-group/`, {
            user_id: user.id,
            prp_roles: [{role: PRP_ROLE.CLUSTER_SYSTEM_ADMIN}]
        })
            .then(this.closeAndReload)
    }

    onConfirm() {
        switch (this.state.action) {
            case CONFIRM_ACTIONS.MAKE_IP_ADMIN:
                this.makeIpAdmin(this.state.selectedPermission);
                break;
            case CONFIRM_ACTIONS.MAKE_CLUSTER_ADMIN:
                this.makeClusterAdmin(this.state.selectedUser);
                break;
            case CONFIRM_ACTIONS.DEACTIVATE_AO:
                this.patchAo(this.state.selectedPermission, false);
                break;
            case CONFIRM_ACTIONS.ACTIVATE_AO:
                this.patchAo(this.state.selectedPermission, true);
                break;
            default:
                this.deletePermission(this.state.selectedPermission);
                break;
        }
    }

    setAoFilter() {
        this.setState({
            filterValues: {
                roles: [PRP_ROLE.IP_AUTHORIZED_OFFICER]
            }
        })
    }

    onFilterReset() {
        this.setState({filterValues: {}})
    }

    patchAo(permission, is_active) {
        const {fetchOtherAo, invalidateOtherAo, portal} = this.props;

        api.patch(`id-management/role-group/${permission.id}/`, {is_active})
            .then(this.closeAndReload);

        if (portal === PORTALS.IP) {
            invalidateOtherAo();
            fetchOtherAo();
        }
    }

    render() {
        const {dialogOpen, handleDialogOpen, handleDialogClose, filterChange, listProps, reload, otherAo, portal} = this.props;

        const showAoAlert = portal === PORTALS.IP && this.state.isAo && otherAo;
        const dialogWidth = portal === PORTALS.IP ? 'sm' : 'md';

        return (
            <div>
                <PageHeader>
                    {header} <ButtonNew onClick={() => handleDialogOpen('addUser')}/>
                </PageHeader>

                <PageContent>
                    {showAoAlert &&
                    <AoAlert onClick={this.setAoFilter}/>}

                    <UsersFilter onChange={filterChange} initialValues={this.state.filterValues}
                                 onReset={this.onFilterReset}/>
                    <UsersList {...listProps} {...this.listEventListeners}/>
                </PageContent>

                {this.state.selectedUser &&
                <AddPermissionsDialog width={dialogWidth}
                                      user={this.state.selectedUser}
                                      open={dialogOpen.addPermissions}
                                      onClose={handleDialogClose}
                                      onSave={reload}/>}

                {this.state.selectedPermission &&
                <EditPermissionDialog width={dialogWidth}
                                      user={this.state.selectedUser}
                                      permission={this.state.selectedPermission}
                                      open={dialogOpen.editPermission}
                                      onClose={handleDialogClose}
                                      onSave={reload}/>}

                <ConfirmDialog open={dialogOpen.confirm} onClose={handleDialogClose} onConfirm={this.onConfirm}
                               message={confirmMessages[this.state.action]}/>

                <AddUserDialog open={dialogOpen.addUser} onClose={handleDialogClose} onSave={this.onUserSave}/>
            </div>
        );
    }
}

const getData = (request) => (
    new Promise((resolve) => {
        api.get("id-management/users/", request)
            .then(res => {
                res.data.results.forEach(function (item) {
                    item.name = fullName(item);
                    item.highlight = item.is_incomplete
                });

                resolve(res.data);
            });
    })
);

const defaultFilter = {
    status: [
        USER_STATUS.ACTIVE,
        USER_STATUS.INVITED
    ]
};

const intersectingAo = (otherAo, user) => (
    otherAo &&
    otherAo.some(ao =>
        (ao.prp_roles.some(
                aoRole => (aoRole.role === PRP_ROLE.IP_AUTHORIZED_OFFICER && aoRole.is_active &&
                    user.prp_roles.some(
                        uRole => uRole.role === PRP_ROLE.IP_AUTHORIZED_OFFICER &&
                            uRole.workspace.id === aoRole.workspace.id
                    )
                )
            )
        )
    )
);

const mapStateToProps = (state) => {
    const {otherAo, user} = state;

    return {
        otherAo: intersectingAo(otherAo, user)
    }
};

const mapDispatchToProps = dispatch => {
    return {
        fetchOtherAo: () => dispatch(fetch(FETCH_OPTIONS.OTHER_AO)),
        invalidateOtherAo: () => dispatch(fetchInvalidate(FETCH_OPTIONS.OTHER_AO))
    }
};

Users.propTypes = {
    dialogOpen: PropTypes.object.isRequired,
    fetchOtherAo: PropTypes.func.isRequired,
    filterChange: PropTypes.func,
    getQuery: PropTypes.func.isRequired,
    handleDialogClose: PropTypes.func.isRequired,
    handleDialogOpen: PropTypes.func.isRequired,
    listProps: PropTypes.object.isRequired,
    otherAo: PropTypes.bool,
    reload: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(withProps(user, portal)(withSearch(getData, defaultFilter, [{
    columnName: 'last_login',
    direction: 'desc'
}])(withDialogHandling(Users))));

