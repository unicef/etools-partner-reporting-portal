import React, {Component} from "react";
import PaginatedList from "../common/PaginatedList";
import UserRowExpanded from "./UserRowExpanded";
import {PORTALS} from "../../actions";
import * as R from 'ramda';
import {date} from "../../helpers/filters";
import {FiberManualRecord as Dot} from "@material-ui/icons";
import {red, green, grey} from "@material-ui/core/colors";
import Grid from "@material-ui/core/Grid";
import withProps from "../hoc/withProps";
import {portal} from "../../helpers/props";

const statusColor = {
    ACTIVE: green[500],
    INVITED: red[500],
    DEACTIVATED: grey[900]
};

const statusLabel = {
    ACTIVE: "Active",
    INVITED: "Invited",
    DEACTIVATED: "Deactivated"
};

class UsersList extends Component {
    renderDot(status) {
        const dotStyle = {
            color: statusColor[status],
            fontSize: '16px',
            marginRight: 5
        };

        return <Dot style={dotStyle}/>
    }

    renderStatus(row) {
        return (
            <Grid container alignItems="center">
                <Grid item component={() => this.renderDot(row.status)}/>
                <Grid item>
                    {statusLabel[row.status]}
                </Grid>
            </Grid>
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
        const {portal, data, onPermissionEdit, onPermissionDelete, onPermissionsAdd, onRemoveIpAdmin, onMakeIpAdmin, ...otherProps} = this.props;

        const removableItems = data.results.filter(item => item.canBeDeleted);
        const showDelete = portal === PORTALS.IP && removableItems.length > 0;

        return (
            <div>
                <PaginatedList
                    {...otherProps}
                    data={data}
                    showDelete={showDelete}
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

export default withProps(portal)(UsersList);
