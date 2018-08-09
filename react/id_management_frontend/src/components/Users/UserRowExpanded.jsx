import React, {Component, Fragment} from "react";
import UserRoleControl from "./UserRoleControl";
import LinkButton from "../common/LinkButton";
import {PRP_ROLE, EDITABLE_PRP_ROLES} from "../../constants";
import {hasAnyRole, getUserRole, getUserTypeLabel} from "../../helpers/user";
import {PORTALS} from "../../actions";
import {getLabels} from "../../labels";
import {Typography} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";
import PlainButton from "../common/PlainButton";
import UserRowExpandedText from "./UserRowExpandedText";
import withProps from "../hoc/withProps";
import {portal, user} from "../../helpers/props";

const labels = getLabels({
    userType: "User type",
    makeIpAdmin: "(make IP admin)",
    edit: "edit",
    delete: "delete"
});

const roleCaption = {
    [PORTALS.IP]: `${labels.workspace} / ${labels.role}`,
    [PORTALS.CLUSTER]: `${labels.cluster} / ${labels.role}`
};

const styleSheet = (theme) => ({
    container: {
        padding: `${theme.spacing.unit}px 0`
    },
    userType: {
        marginBottom: theme.spacing.unit * 2
    }
});

class UserRowExpanded extends Component {
    canEdit(userRole) {
        switch (userRole) {
            case PRP_ROLE.IP_ADMIN:
            case PRP_ROLE.CLUSTER_IMO:
            case PRP_ROLE.CLUSTER_MEMBER:
            case PRP_ROLE.CLUSTER_SYSTEM_ADMIN:
                return true;
            default:
                return false;
        }
    }

    getActions(role) {
        const {user, onPermissionEdit, onPermissionDelete, onRemoveIpAdmin, onMakeIpAdmin, row} = this.props;

        const userRole = getUserRole(user, role);

        return (
            <Fragment>
                {this.canEdit(userRole) &&
                hasAnyRole(row, EDITABLE_PRP_ROLES[userRole]) &&
                <Fragment>
                    <LinkButton label={labels.edit} onClick={() => onPermissionEdit(role)}/>
                    <LinkButton label={labels.delete} variant="danger" onClick={() => onPermissionDelete(role)}/>
                </Fragment>}

                {userRole === PRP_ROLE.IP_AUTHORIZED_OFFICER &&
                ([PRP_ROLE.IP_EDITOR, PRP_ROLE.IP_VIEWER].indexOf(role.role) > -1) &&
                <LinkButton label={labels.makeIpAdmin} onClick={() => onMakeIpAdmin(role)}/>}

                {userRole === PRP_ROLE.IP_AUTHORIZED_OFFICER &&
                role.role === PRP_ROLE.IP_ADMIN &&
                <LinkButton label={labels.delete} variant="danger" onClick={() => onRemoveIpAdmin(role)}/>}
            </Fragment>
        )
    }

    canAdd(user) {
        return hasAnyRole(user, [
             PRP_ROLE.IP_ADMIN,
             PRP_ROLE.IP_AUTHORIZED_OFFICER,
             PRP_ROLE.CLUSTER_IMO,
             PRP_ROLE.CLUSTER_MEMBER,
             PRP_ROLE.CLUSTER_SYSTEM_ADMIN,
        ]);
    }

    render() {
        const {user, row, portal, classes, onPermissionsAdd} = this.props;
        const roles = row.prp_roles;
        const userTypeLabel = row.user_type ? getUserTypeLabel(row.user_type) : null;

        return (
            <div className={classes.container}>
                {row.user_type &&
                <div className={roles.length ? classes.userType : ''}>
                    <Typography variant="caption" gutterBottom>{labels.userType}</Typography>
                    <UserRowExpandedText>{userTypeLabel}</UserRowExpandedText>
                </div>}

                {roles.length > 0 &&
                <Typography variant="caption" gutterBottom>{roleCaption[portal]}</Typography>}

                {roles.map(role => (
                    <UserRoleControl key={role.id} role={role} actions={this.getActions(role)}/>
                ))}

                {this.canAdd(user) &&
                <PlainButton color="primary" onClick={() => onPermissionsAdd(row)}>Add new permission</PlainButton>}
            </div>
        );
    }
}

export default withProps(portal, user)(withStyles(styleSheet)(UserRowExpanded));
