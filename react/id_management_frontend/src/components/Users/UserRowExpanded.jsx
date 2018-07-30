import React, {Component} from "react";
import UserWorkspaceRoleControl from "./UserWorkspaceRoleControl";
import LinkButton from "../common/LinkButton";

class UserRowExpanded extends Component {
    getActions(role) {
        const {user, onPermissionEdit} = this.props;

        return (
            <LinkButton label="edit" onClick={() => onPermissionEdit(user, role)}/>
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
