import React, {Component, Fragment} from "react";
import UserWorkspaceRoleControl from "./UserWorkspaceRoleControl";
import LinkButton from "../common/LinkButton";

class UserRowExpanded extends Component {
    getActions(role) {
        const {user, onPermissionEdit, onPermissionDelete} = this.props;

        return (
            <Fragment>
                <LinkButton label="edit" onClick={() => onPermissionEdit(user, role)}/>
                <LinkButton label="delete" variant="danger" onClick={() => onPermissionDelete(user, role)}/>
            </Fragment>
        )
    }

    render() {
        const {user} = this.props;

        return (
            <div>
                {user.prp_roles.map(role => (
                    <UserWorkspaceRoleControl key={role.id} role={role.role} actions={this.getActions(role)}/>
                ))}
            </div>
        );
    }
}

export default UserRowExpanded;
