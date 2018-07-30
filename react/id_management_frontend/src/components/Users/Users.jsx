import React, {Component} from "react";
import PageHeader from "../common/PageHeader";
import ButtonNew from "../common/ButtonNew";
import PageContent from "../common/PageContent";
import UsersFilter from "./UsersFilter";
import UsersList from "./UsersList";
import {debounce} from 'throttle-debounce';
import {api} from "../../infrastructure/api";
import {fullName} from "../../helpers/filters";
import qs from 'query-string';
import AddUserDialog from "./AddUserDialog";
import withDialogHandling from "../hoc/withDialogHandling";
import AddPermissionsDialog from "./AddPermissionsDialog";
import EditPermissionDialog from "./EditPermissionDialog";
import ConfirmDialog from "../common/ConfirmDialog";

const header = "Users";
const CONFIRM_ACTIONS = {
    DELETE: "DELETE",
    MAKE_IP_ADMIN: "MAKE_IP_ADMIN",
    REMOVE_IP_ADMIN: "REMOVE_IP_ADMIN"
};
const confirmMessages = {
    [CONFIRM_ACTIONS.DELETE]: "Are you sure you want to remove IP Admin role for this user in this workspace?",
    [CONFIRM_ACTIONS.MAKE_IP_ADMIN]: "Are you sure you want to make this user an IP Admin in this workspace?",
    [CONFIRM_ACTIONS.REMOVE_IP_ADMIN]: "Are you sure you want to remove IP Admin role for this user in this workspace?"
};

class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            selectedUser: null,
            selectedPermission: null,
            addUserDialogOpen: false,
            action: CONFIRM_ACTIONS.DELETE
        };
        this.filterChange = debounce(500, (filter) => this.onSearch(filter));
        this.reload = this.reload.bind(this);
        this.onUserSave = this.onUserSave.bind(this);
        this.openAddPermissionsDialog = this.openAddPermissionsDialog.bind(this);
        this.openEditPermissionsDialog = this.openEditPermissionsDialog.bind(this);
        this.onConfirm = this.onConfirm.bind(this);
    }

    reload() {
        this.onSearch(this.getQuery());
    }

    componentDidMount() {
        this.reload();
    }

    getQuery() {
        return qs.parse(this.props.history.location.search);
    }

    onSearch(filter) {
        api.get("id-management/users/", filter)
            .then(res => this.setState({
                items: res.data.map(function (item) {
                    item.name = fullName(item);
                    return item;
                })
            }));

        const {history} = this.props;

        history.push({
            pathname: history.location.pathname,
            search: qs.stringify(filter)
        });
    }

    onUserSave(user) {
        this.reload();
        this.openAddPermissionsDialog(user);
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
        return (user, permission) => {
            this.setState({confirmAction: action, selectedUser: user, selectedPermission: permission});
            this.props.handleDialogOpen("confirm");
        }
    }

    onConfirm() {
        console.log(this.state.action);
    }

    render() {
        const {dialogOpen, handleDialogOpen, handleDialogClose} = this.props;

        return (
            <div>
                <PageHeader>
                    {header} <ButtonNew onClick={() => handleDialogOpen('addUser')}/>
                </PageHeader>

                <PageContent>
                    <UsersFilter onChange={this.filterChange} initialValues={this.getQuery()}/>
                    <UsersList items={this.state.items} onPermissionEdit={this.openEditPermissionsDialog}
                               onPermissionDelete={this.openConfirmDialog(CONFIRM_ACTIONS.DELETE)}/>
                </PageContent>

                {this.state.selectedUser &&
                <AddPermissionsDialog user={this.state.selectedUser} open={dialogOpen.addPermissions}
                                      onClose={handleDialogClose}/>}

                {this.state.selectedUser && this.state.selectedPermission &&
                <EditPermissionDialog user={this.state.selectedUser} permission={this.state.selectedPermission}
                                      open={dialogOpen.editPermission}
                                      onClose={handleDialogClose}/>}

                <ConfirmDialog open={dialogOpen.confirm} onClose={handleDialogClose} onConfirm={this.onConfirm}
                               message={confirmMessages[this.state.action]}/>

                <AddUserDialog open={dialogOpen.addUser} onClose={handleDialogClose} onSave={this.onUserSave}/>
            </div>
        );
    }
}

export default withDialogHandling(Users);
