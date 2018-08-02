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

const header = "Users";
const CONFIRM_ACTIONS = {
    DELETE_PERMISSION: "DELETE_PERMISSION",
    MAKE_IP_ADMIN: "MAKE_IP_ADMIN",
    REMOVE_IP_ADMIN: "REMOVE_IP_ADMIN"
};
const confirmMessages = {
    [CONFIRM_ACTIONS.DELETE_PERMISSION]: "Are you sure you want to remove IP Admin role for this user in this workspace?",
    [CONFIRM_ACTIONS.MAKE_IP_ADMIN]: "Are you sure you want to make this user an IP Admin in this workspace?",
    [CONFIRM_ACTIONS.REMOVE_IP_ADMIN]: "Are you sure you want to remove IP Admin role for this user in this workspace?"
};

class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedUser: null,
            selectedPermission: null,
            addUserDialogOpen: false,
            action: CONFIRM_ACTIONS.DELETE_PERMISSION
        };

        this.onUserSave = this.onUserSave.bind(this);
        this.openAddPermissionsDialog = this.openAddPermissionsDialog.bind(this);
        this.openEditPermissionsDialog = this.openEditPermissionsDialog.bind(this);
        this.onConfirm = this.onConfirm.bind(this);
        this.closeAndReload = this.closeAndReload.bind(this);
    }

    onUserSave(user) {
        const {reload} = this.props;

        reload();
        this.openAddPermissionsDialog(user);
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
        return (permission) => {
            this.setState({confirmAction: action, selectedPermission: permission});
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

    onConfirm() {
        switch (this.state.action) {
            case CONFIRM_ACTIONS.DELETE_PERMISSION:
                this.deletePermission(this.state.selectedPermission);
                break;
        }
    }

    render() {
        const {dialogOpen, handleDialogOpen, handleDialogClose, filterChange, listProps, getQuery, reload} = this.props;

        return (
            <div>
                <PageHeader>
                    {header} <ButtonNew onClick={() => handleDialogOpen('addUser')}/>
                </PageHeader>

                <PageContent>
                    <UsersFilter onChange={filterChange} initialValues={getQuery()}/>
                    <UsersList {...listProps}
                               onPermissionsAdd={this.openAddPermissionsDialog}
                               onPermissionEdit={this.openEditPermissionsDialog}
                               onPermissionDelete={this.openConfirmDialog(CONFIRM_ACTIONS.DELETE_PERMISSION)}/>
                </PageContent>

                {this.state.selectedUser &&
                <AddPermissionsDialog user={this.state.selectedUser}
                                      open={dialogOpen.addPermissions}
                                      onClose={handleDialogClose}
                                      onSave={reload}/>}

                {this.state.selectedUser && this.state.selectedPermission &&
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

const getData = (request) => (
    new Promise((resolve, reject) => {
        api.get("id-management/users/", request)
            .then(res => {
                res.data.results.forEach(function (item) {
                    item.name = fullName(item);
                });

                resolve(res.data);
            });
    })
);

export default withSearch(getData)(withDialogHandling(Users));
