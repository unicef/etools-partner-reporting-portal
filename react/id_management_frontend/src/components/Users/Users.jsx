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
import {PRP_ROLE, USER_TYPE} from "../../constants";
import withProps from "../hoc/withProps";
import {user} from "../../helpers/props";
import {hasAnyRole, hasOnlyRoles, userRoleInWorkspace} from "../../helpers/user";
import AoAlert from "./AoAlert";
import {FETCH_OPTIONS, fetch} from "../../fetch";
import {connect} from "react-redux";

const header = "Users";
const CONFIRM_ACTIONS = {
    DELETE_PERMISSION: "DELETE_PERMISSION",
    MAKE_IP_ADMIN: "MAKE_IP_ADMIN",
    REMOVE_IP_ADMIN: "REMOVE_IP_ADMIN",
    DISABLE_USER: "DISABLE_USER",
    ENABLE_USER: "ENABLE_USER",
    MAKE_CLUSTER_ADMIN: "MAKE_CLUSTER_ADMIN"
};
const confirmMessages = {
    [CONFIRM_ACTIONS.DELETE_PERMISSION]: "Are you sure you want to remove this role for this user?",
    [CONFIRM_ACTIONS.MAKE_IP_ADMIN]: "Are you sure you want to make this user an IP Admin in this workspace?",
    [CONFIRM_ACTIONS.REMOVE_IP_ADMIN]: "Are you sure you want to remove IP Admin role for this user in this workspace?",
    [CONFIRM_ACTIONS.DISABLE_USER]: "Are you sure you want to disable this user?",
    [CONFIRM_ACTIONS.ENABLE_USER]: "Are you sure you want to enable this user?",
    [CONFIRM_ACTIONS.MAKE_CLUSTER_ADMIN]: "Are you sure you want to make this user an Cluster Admin?"
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
            onDelete: this.openConfirmDialog(CONFIRM_ACTIONS.DISABLE_USER),
            onRestore: this.openConfirmDialog(CONFIRM_ACTIONS.ENABLE_USER),
            onMakeSystemAdmin: this.openConfirmDialog(CONFIRM_ACTIONS.MAKE_CLUSTER_ADMIN)
        };

        this.onUserSave = this.onUserSave.bind(this);
        this.onConfirm = this.onConfirm.bind(this);
        this.closeAndReload = this.closeAndReload.bind(this);
        this.setAoFilter = this.setAoFilter.bind(this);
        this.onFilterReset = this.onFilterReset.bind(this);

        if (this.state.isAo) {
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

    openEditPermissionsDialog(permission) {
        this.setState({selectedPermission: permission});
        this.props.handleDialogOpen("editPermission");
    }

    openConfirmDialog(action) {
        return (item) => {
            switch (action) {
                case CONFIRM_ACTIONS.DISABLE_USER:
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
            case CONFIRM_ACTIONS.DISABLE_USER:
                this.disableUser(this.state.selectedUser);
                break;
            case CONFIRM_ACTIONS.ENABLE_USER:
                this.enableUser(this.state.selectedUser);
                break;
            case CONFIRM_ACTIONS.MAKE_CLUSTER_ADMIN:
                this.makeClusterAdmin(this.state.selectedUser);
                break;
            default:
                this.deletePermission(this.state.selectedPermission);
                break;
        }
    }

    disableUser(user) {
        api.post(`id-management/users/${user.id}/deactivate/`)
            .then(this.closeAndReload)
    }

    enableUser(user) {
        api.post(`id-management/users/${user.id}/activate/`)
            .then(this.closeAndReload)
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

    render() {
        const {dialogOpen, handleDialogOpen, handleDialogClose, filterChange, listProps, reload, otherAo} = this.props;

        const showAoAlert = this.state.isAo && otherAo;

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
                <AddPermissionsDialog user={this.state.selectedUser}
                                      open={dialogOpen.addPermissions}
                                      onClose={handleDialogClose}
                                      onSave={reload}/>}

                {this.state.selectedPermission &&
                <EditPermissionDialog user={this.state.selectedUser}
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

const canDelete = (user, item) => {
    let hasIpAdmin = true;

    item.prp_roles.forEach(role => {
        if (!role.workspace || userRoleInWorkspace(user, role.workspace.id) !== PRP_ROLE.IP_ADMIN) {
            hasIpAdmin = false;
        }
    });

    return hasIpAdmin && hasOnlyRoles(item, [PRP_ROLE.IP_EDITOR, PRP_ROLE.IP_VIEWER])
};

const getData = (request, user) => (
    new Promise((resolve, reject) => {
        api.get("id-management/users/", request)
            .then(res => {
                res.data.results.forEach(function (item) {
                    item.name = fullName(item);
                    item.canBeDeleted = item.status !== "DEACTIVATED" && canDelete(user, item);
                    item.canBeRestored = item.status === "DEACTIVATED" && canDelete(user, item);
                    item.highlight = item.is_incomplete
                });

                resolve(res.data);
            });
    })
);

const mapStateToProps = (state) => {
    const {otherAo} = state;

    return {
        otherAo
    }
};

const mapDispatchToProps = dispatch => {
    return {
        fetchOtherAo: () => dispatch(fetch(FETCH_OPTIONS.OTHER_AO))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(withSearch(getData)(withProps(user)(withDialogHandling(Users))));
