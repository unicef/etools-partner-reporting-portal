import React, { Component } from "react";
import PageHeader from "../common/PageHeader";
import ButtonNew from "../common/ButtonNew";
import PageContent from "../common/PageContent";
import UsersFilter from "./UsersFilter";
import UsersList from "./UsersList";

const labels = {
    header: "Users"
};

class Users extends Component {
    render() {
        return (
            <div>
                <PageHeader>
                    {labels.header} <ButtonNew />
                </PageHeader>

                <PageContent>
                    <UsersFilter />
                    <UsersList />
                </PageContent>
            </div>
        );
    }
}

export default Users;
