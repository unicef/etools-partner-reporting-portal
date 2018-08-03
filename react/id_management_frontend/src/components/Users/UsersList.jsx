import React, {Component} from "react";
import PaginatedList from "../common/PaginatedList";
import UserRowExpanded from "./UserRowExpanded";
import withPortal from "../hoc/withPortal";
import {PORTALS} from "../../actions";
import * as R from 'ramda';
import {date} from "../../helpers/filters";

class UsersList extends Component {
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
                title: "Status"
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
        const {onPermissionEdit, onPermissionDelete, onPermissionsAdd, onRemoveIpAdmin, onMakeIpAdmin, ...otherProps} = this.props;

        return (
            <div>
                <PaginatedList
                    {...otherProps}
                    columns={this.getColumns()}
                    expandedCell={row => (
                        <UserRowExpanded row={row}
                                         onPermissionEdit={onPermissionEdit}
                                         onPermissionDelete={onPermissionDelete}
                                         onPermissionsAdd={onPermissionsAdd}
                                         onRemoveIpAdmin={onRemoveIpAdmin}
                                         onMakeIpAdmin={onMakeIpAdmin}
                        />
                    )}
                />
            </div>
        );
    }
}

export default withPortal(UsersList);
