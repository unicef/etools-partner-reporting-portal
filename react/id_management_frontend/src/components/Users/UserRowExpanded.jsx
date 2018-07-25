import React, { Component } from "react";
import UserRoleControl from "./UserRoleControl";

const labels = {
    header: "Users"
};

const roles = [
    {
        name: "Kenya / IP Viewer"
    },
    { name: "China / IP Viewer" },
    { name: "India / IP Admin" },
    { name: "Pakistan / IP Editor" }
];

class UserRowExpanded extends Component {
    render() {
        return (
            <div>
                {roles.map(role => (
                    <UserRoleControl key={role.name} role={role.name} />
                ))}
            </div>
        );
    }
}

export default UserRowExpanded;
