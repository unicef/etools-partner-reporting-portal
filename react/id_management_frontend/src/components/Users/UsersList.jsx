import React, { Component } from "react";
import PaginatedList from "../common/PaginatedList";
import UserRowExpanded from "./UserRowExpanded";

const labels = {
    header: "Users"
};

class UsersList extends Component {
    getColumns() {
        return [
            {
                name: "name",
                title: "Name"
            },
            {
                name: "position",
                title: "Position"
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
                name: "last_login",
                title: "Last login"
            }
        ]
    }

    render() {
        const {items} = this.props;

        return (
            <div>
                <PaginatedList
                    items={items}
                    columns={this.getColumns()}
                    expandedCell={row => <UserRowExpanded user={row} />}
                />
            </div>
        );
    }
}

export default UsersList;
