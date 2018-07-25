import React, { Component } from "react";
import PaginatedList from "../common/PaginatedList";
import UserRowExpanded from "./UserRowExpanded";

const labels = {
    header: "Users"
};

// TODO: Remove when API connected
const items = [
    {
        name: "John Lemon",
        position: "Manager",
        email: "john.lemon@moln.org",
        status: "active",
        last_login: "2018-07-23"
    },
    {
        name: "John Lemon",
        position: "Manager",
        email: "john.lemon@moln.org",
        status: "active",
        last_login: "2018-07-23"
    },
    {
        name: "John Lemon",
        position: "Manager",
        email: "john.lemon@moln.org",
        status: "active",
        last_login: "2018-07-23"
    },
    {
        name: "John Lemon",
        position: "Manager",
        email: "john.lemon@moln.org",
        status: "active",
        last_login: "2018-07-23"
    },
    {
        name: "John Lemon",
        position: "Manager",
        email: "john.lemon@moln.org",
        status: "active",
        last_login: "2018-07-23"
    },
    {
        name: "John Lemon",
        position: "Manager",
        email: "john.lemon@moln.org",
        status: "active",
        last_login: "2018-07-23"
    },
    {
        name: "John Lemon",
        position: "Manager",
        email: "john.lemon@moln.org",
        status: "active",
        last_login: "2018-07-23"
    },
    {
        name: "John Lemon",
        position: "Manager",
        email: "john.lemon@moln.org",
        status: "active",
        last_login: "2018-07-23"
    },
    {
        name: "John Lemon",
        position: "Manager",
        email: "john.lemon@moln.org",
        status: "active",
        last_login: "2018-07-23"
    },
    {
        name: "John Lemon",
        position: "Manager",
        email: "john.lemon@moln.org",
        status: "active",
        last_login: "2018-07-23"
    },
    {
        name: "John Lemon",
        position: "Manager",
        email: "john.lemon@moln.org",
        status: "active",
        last_login: "2018-07-23"
    },

]

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
