import PropTypes from 'prop-types'
import React, {Component, Fragment} from "react";
import UserRoleControl from "./UserRoleControl";
import LinkButton from "../common/LinkButton";
import {getUserTypeLabel} from "../../helpers/user";
import {PORTALS} from "../../actions";
import {getLabels} from "../../labels";
import {Typography} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";
import PlainButton from "../common/PlainButton";
import withProps from "../hoc/withProps";
import {permissions} from "../../helpers/props";
import SmallValue from "../common/SmallText";
import {USER_TYPE} from "../../constants";

const labels = getLabels({
    userType: "User type",
    makeIpAdmin: "(make IP admin)",
    edit: "edit",
    delete: "delete",
    addPermission: "Add new permission",
    makeSystemAdmin: "Make system admin",
    deactivate: "deactivate",
    activate: "activate"
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
    getActions(role, row) {
        const {
            onPermissionEdit,
            onPermissionDelete,
            onRemoveIpAdmin,
            onMakeIpAdmin,
            onDeactivateAo,
            onActivateAo,
            permissions
        } = this.props;

        return (
            <Fragment>
                {permissions.editUserPermission(role, row) &&
                <Fragment>
                    <LinkButton label={labels.edit} onClick={() => onPermissionEdit(row, role)}/>
                    {!permissions.revokeIpAdmin(role) &&
                    <LinkButton label={labels.delete} variant="danger" onClick={() => onPermissionDelete(role)}/>}
                </Fragment>}

                {permissions.makeIpAdmin(role) &&
                <LinkButton label={labels.makeIpAdmin} onClick={() => onMakeIpAdmin(role)}/>}

                {permissions.revokeIpAdmin(role) &&
                <LinkButton label={labels.delete} variant="danger" onClick={() => onRemoveIpAdmin(role)}/>}

                {permissions.manageAo(role) &&
                <Fragment>
                    {role.is_active &&
                    <LinkButton label={labels.deactivate} variant="danger" onClick={() => onDeactivateAo(role)}/>}

                    {!role.is_active &&
                    <LinkButton label={labels.activate} onClick={() => onActivateAo(role)}/>}
                </Fragment>}
            </Fragment>
        )
    }

    render() {
        const {row, portal, classes, onPermissionsAdd, onMakeSystemAdmin, permissions} = this.props;
        const roles = row.prp_roles;
        const userTypeLabel = getUserTypeLabel(row.user_type || (row.partner ? USER_TYPE.PARTNER : USER_TYPE.IMO));

        return (
            <div className={classes.container}>
                <div className={roles.length ? classes.userType : ''}>
                    <Typography variant="caption" gutterBottom>{labels.userType}</Typography>
                    <SmallValue>{userTypeLabel}</SmallValue>
                </div>

                {roles.length > 0 &&
                <Typography variant="caption" gutterBottom>{roleCaption[portal]}</Typography>}

                {roles.map(role => (
                    <UserRoleControl key={role.id} role={role} actions={this.getActions(role, row)}/>
                ))}

                {permissions.addUserPermission(row) &&
                <PlainButton color="primary" onClick={() => onPermissionsAdd(row)}>{labels.addPermission}</PlainButton>}

                {permissions.makeSystemAdmin(row) &&
                <div>
                    <PlainButton color="primary"
                                 onClick={() => onMakeSystemAdmin(row)}>{labels.makeSystemAdmin}</PlainButton>
                </div>}
            </div>
        );
    }
}

UserRowExpanded.propTypes = {
    classes: PropTypes.object.isRequired,
    onMakeIpAdmin: PropTypes.func.isRequired,
    onMakeSystemAdmin: PropTypes.func.isRequired,
    onPermissionDelete: PropTypes.func.isRequired,
    onPermissionEdit: PropTypes.func.isRequired,
    onPermissionsAdd: PropTypes.func.isRequired,
    onRemoveIpAdmin: PropTypes.func.isRequired,
    row: PropTypes.object.isRequired,
};

export default withProps(permissions)(withStyles(styleSheet)(UserRowExpanded));

