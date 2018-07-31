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

const firstPage = 1;
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
            data: {
                results: []
            },
            selectedUser: null,
            selectedPermission: null,
            addUserDialogOpen: false,
            action: CONFIRM_ACTIONS.DELETE,
            page: firstPage,
            page_size: 10,
            loading: false
        };

        this.filterChange = debounce(500, (filter) => {
            this.onSearch(filter, firstPage);
        });

        this.reload = this.reload.bind(this);
        this.onUserSave = this.onUserSave.bind(this);
        this.openAddPermissionsDialog = this.openAddPermissionsDialog.bind(this);
        this.openEditPermissionsDialog = this.openEditPermissionsDialog.bind(this);
        this.onConfirm = this.onConfirm.bind(this);
        this.onPageSizeChange = this.onPageSizeChange.bind(this);
    }

    reload(page, pageSize) {
        this.onSearch(this.getQuery(), page, pageSize);
    }

    componentDidMount() {
        this.reload();
    }

    getQuery() {
        return qs.parse(this.props.history.location.search);
    }

    onPageSizeChange(pageSize) {
        this.reload(firstPage, pageSize);
    }

    onSearch(filter, page, pageSize) {
        let request = filter;

        request.page = page || filter.page || this.state.page;
        request.page_size = pageSize || filter.page_size || this.state.page_size;

        this.setState({
            page: parseInt(request.page),
            page_size: parseInt(request.page_size),
            loading: true
        });

        api.get("id-management/users/", request)
            .then(res => {
                res.data.results.forEach(function (item) {
                    item.name = fullName(item);
                });

                this.setState({
                    data: res.data,
                    loading: false
                })
            });

        const {history} = this.props;

        history.push({
            pathname: history.location.pathname,
            search: qs.stringify(request)
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
                    <UsersList loading={this.state.loading} pageSize={this.state.page_size}
                               onPageSizeChange={this.onPageSizeChange} page={this.state.page}
                               onPageChange={this.reload} data={this.state.data}
                               onPermissionEdit={this.openEditPermissionsDialog}
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
