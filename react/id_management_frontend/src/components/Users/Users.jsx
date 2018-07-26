import React, {Component} from "react";
import PageHeader from "../common/PageHeader";
import ButtonNew from "../common/ButtonNew";
import PageContent from "../common/PageContent";
import UsersFilter from "./UsersFilter";
import UsersList from "./UsersList";
import {debounce} from 'throttle-debounce';
import {api} from "../../infrastructure/api";
import {fullName} from "../../helpers/filters";
import {merge} from 'ramda';
import qs from 'query-string';

const labels = {
    header: "Users"
};

class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            items: []
        };
        this.filterChange = debounce(500, (filter) => this.onSearch(filter));
    }

    componentDidMount() {
        this.onSearch();
    }

    onSearch(filter) {
        api.get("id-management/users/", filter)
            .then(res => this.setState({
                items: res.data.map(function (item) {
                    item.name = fullName(item);
                    return item;
                })
            }));

        const { history } = this.props;

        history.push({
            pathname: history.location.pathname,
            search: qs.stringify(merge(history.location.query, filter))
        });
    }

    render() {
        return (
            <div>
                <PageHeader>
                    {labels.header} <ButtonNew/>
                </PageHeader>

                <PageContent>
                    <UsersFilter onChange={this.filterChange}/>
                    <UsersList items={this.state.items}/>
                </PageContent>
            </div>
        );
    }
}

export default Users;
