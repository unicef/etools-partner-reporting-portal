import React, { Component } from "react";
import UserRoleControl from "./UserWorkspaceRoleControl";

class UserRowExpanded extends Component {
    render() {
        const {user} = this.props;

        return (
            <div>
                {user.prp_roles.map(role => (
                    <UserRoleControl key={role.id} role={role.role} />
                ))}
            </div>
        );
    }
}

export default UserRowExpanded;
