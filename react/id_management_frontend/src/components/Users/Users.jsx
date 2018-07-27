import React, {Component} from "react";
import PageHeader from "../common/PageHeader";
import ButtonNew from "../common/ButtonNew";
import PageContent from "../common/PageContent";
import UsersFilter from "./UsersFilter";
import UsersList from "./UsersList";
import {debounce} from 'throttle-debounce';
import {api} from "../../infrastructure/api";
import {fullName} from "../../helpers/filters";
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
        this.onSearch(this.getQuery());
    }

    getQuery() {
        return qs.parse(this.props.history.location.search);
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
            search: qs.stringify(filter)
        });
    }

    render() {
        return (
            <div>
                <PageHeader>
                    {labels.header} <ButtonNew/>
                </PageHeader>

                <PageContent>
                    <UsersFilter onChange={this.filterChange} initialValues={this.getQuery()}/>
                    <UsersList items={this.state.items}/>
                </PageContent>
            </div>
        );
    }
}

export default Users;
