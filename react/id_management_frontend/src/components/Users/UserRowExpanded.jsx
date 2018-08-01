import React, {Component, Fragment} from "react";
import UserRoleControl from "./UserRoleControl";
import LinkButton from "../common/LinkButton";
import {PRP_ROLE, EDITABLE_PRP_ROLES} from "../../constants";
import withUser from "../hoc/withUser";
import {hasAnyRole} from "../../helpers/user";
import {PORTALS} from "../../actions";
import labels from "../../labels";
import {Typography} from "@material-ui/core";
import withPortal from "../hoc/withPortal";
import {withStyles} from "@material-ui/core/styles";
import PlainButton from "../common/PlainButton";

const roleCaption = {
    [PORTALS.IP]: `${labels.workspace} / ${labels.role}`,
    [PORTALS.CLUSTER]: `${labels.cluster} / ${labels.role}`
};

const styleSheet = (theme) => ({
    container: {
        padding: `${theme.spacing.unit}px 0`
    }
});

class UserRowExpanded extends Component {
    getActions(role) {
        const {user, onPermissionEdit, onPermissionDelete, row, portal} = this.props;

        return (
            <Fragment>
                {user.prpRole[PRP_ROLE.IP_ADMIN] && hasAnyRole(row, EDITABLE_PRP_ROLES[portal]) &&
                <Fragment>
                    <LinkButton label="edit" onClick={() => onPermissionEdit(role)}/>
                    <LinkButton label="delete" variant="danger" onClick={() => onPermissionDelete(role)}/>
                </Fragment>}
            </Fragment>
        )
    }

    render() {
        const {user, row, portal, classes, onPermissionsAdd} = this.props;

        return (
            <div className={classes.container}>
                {row.prp_roles.length > 0 &&
                <Typography variant="caption" gutterBottom>{roleCaption[portal]}</Typography>}

                {row.prp_roles.map(role => (
                    <UserRoleControl key={role.id} role={role} actions={this.getActions(role)}/>
                ))}

                {user.prpRole[PRP_ROLE.IP_ADMIN] &&
                <PlainButton color="primary" onClick={() => onPermissionsAdd(row)}>Add new permission</PlainButton>}
            </div>
        );
    }
}

export default withPortal(withUser(withStyles(styleSheet)(UserRowExpanded)));
