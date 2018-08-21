import PropTypes from 'prop-types'
import React, {Component} from "react";
import PaginatedList from "../common/PaginatedList";
import UserRowExpanded from "./UserRowExpanded";
import {PORTALS} from "../../actions";
import * as R from 'ramda';
import {date} from "../../helpers/filters";
import withProps from "../hoc/withProps";
import {permissions, portal} from "../../helpers/props";
import UserRowStatus from "./UserRowStatus";

class UsersList extends Component {
    renderStatus(row) {
        return (
            <UserRowStatus row={row}/>
        )
    }

    getColumns() {
        const {portal} = this.props;

        const cols = [
            {
                name: "name",
                title: "Name"
            },
            {
                name: "email",
                title: "E-mail"
            },
            {
                name: "status",
                title: "Status",
                getCellValue: (row) => this.renderStatus(row)
            },
            {
                title: "Last login",
                name: "last_login",
                getCellValue: row => row.last_login ? date(row.last_login) : ''
            }
        ];

        const secondCol = {
            [PORTALS.IP]: {
                name: "position",
                title: "Position"
            },
            [PORTALS.CLUSTER]: {
                title: "Partner",
                name: "partner",
                getCellValue: row => row.partner ? row.partner.title : ''
            }
        };

        return R.insert(1, secondCol[portal], cols);
    }

    render() {
        const {
            data,
            onPermissionEdit,
            onPermissionDelete,
            onPermissionsAdd,
            onRemoveIpAdmin,
            onMakeIpAdmin,
            onMakeSystemAdmin,
            permissions,
            ...otherProps
        } = this.props;

        const removableItems = data.results.filter(item => item.canBeDeleted);
        const restorebleItems = data.results.filter(item => item.canBeRestored);
        const showDelete = permissions.manageUser && removableItems.length > 0;
        const showRestore = permissions.manageUser && restorebleItems.length > 0;

        return (
            <div>
                <PaginatedList
                    {...otherProps}
                    data={data}
                    showDelete={showDelete}
                    showRestore={showRestore}
                    columns={this.getColumns()}
                    expandedCell={row => (
                        <UserRowExpanded row={row}
                                         onPermissionEdit={onPermissionEdit}
                                         onPermissionDelete={onPermissionDelete}
                                         onPermissionsAdd={onPermissionsAdd}
                                         onRemoveIpAdmin={onRemoveIpAdmin}
                                         onMakeIpAdmin={onMakeIpAdmin}
                                         onMakeSystemAdmin={onMakeSystemAdmin}
                        />
                    )}
                />
            </div>
        );
    }
}

UsersList.propTypes = {
    data: PropTypes.object,
    onMakeIpAdmin: PropTypes.func.isRequired,
    onMakeSystemAdmin: PropTypes.func.isRequired,
    onPermissionDelete: PropTypes.func.isRequired,
    onPermissionEdit: PropTypes.func.isRequired,
    onPermissionsAdd: PropTypes.func.isRequired,
    onRemoveIpAdmin: PropTypes.func.isRequired,
    portal: PropTypes.string,
    permissions: PropTypes.object.isRequired,
};

export default withProps(portal, permissions)(UsersList);

