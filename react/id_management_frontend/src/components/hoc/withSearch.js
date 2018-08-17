import React, {Component} from 'react';
import qs from "query-string";
import {debounce} from "throttle-debounce";
import {expandedRowIds} from "../../actions";
import {connect} from "react-redux";
import {PORTAL_TYPE} from "../../constants";

/*
    withSearch adds default search functionality to a component
    @param {function} getDataFn should provide data in a form presented below

    {
        count: Int,
        results: Array<Object>
    }

    the component adds following props:
    Object: listProps - should then be passed to PaginatedList component
    Function: reload() - force reloading existing page
    Function: getQuery() - get URL params
    Function: filterChange(filter) - debounced function that should be called on filter value changes
 */

const firstPage = 1;
const arrayFormat = 'bracket';

const mapStateToProps = state => {
    return {
        portal: PORTAL_TYPE[state.portal],
        user: state.user
    }
};

const mapDispatchToProps = dispatch => {
    return {
        resetExpandedRows: () => dispatch(expandedRowIds([]))
    }
};

export default (getDataFn) => {
    return WrappedComponent =>
        connect(mapStateToProps, mapDispatchToProps)(
            class WithSearch extends Component {
                constructor(props) {
                    super(props);
                    this.state = {
                        data: {
                            results: []
                        },
                        page: firstPage,
                        page_size: 10,
                        loading: false
                    };

                    this.filterChange = debounce(500, (filter) => {
                        this.onSearch(filter, firstPage);
                        props.resetExpandedRows();
                    });

                    this.getQuery = this.getQuery.bind(this);
                    this.reload = this.reload.bind(this);
                    this.onPageChange = this.onPageChange.bind(this);
                }

                reload(page, pageSize) {
                    this.onSearch(this.getQuery(), page, pageSize);
                }

                componentDidMount() {
                    this.reload();
                    this.props.resetExpandedRows();
                }

                getQuery() {
                    return qs.parse(this.props.history.location.search, {arrayFormat});
                }

                onPageSizeChange(pageSize) {
                    this.reload(firstPage, pageSize);
                    this.props.resetExpandedRows();
                }

                onPageChange(page, pageSize) {
                    this.reload(page, pageSize);
                    this.props.resetExpandedRows();
                }

                onSearch(filter, page, pageSize) {
                    const {history, portal, user} = this.props;

                    let request = filter;

                    request.page = page || filter.page || this.state.page;
                    request.page_size = pageSize || filter.page_size || this.state.page_size;

                    this.setState({
                        page: parseInt(request.page, 10),
                        page_size: parseInt(request.page_size, 10),
                        loading: true
                    });

                    Promise.resolve(getDataFn(Object.assign({}, request, {
                        portal
                    }), user))
                        .then(data => this.setState({data, loading: false}));


                    history.push({
                        pathname: history.location.pathname,
                        search: qs.stringify(request, {arrayFormat})
                    });
                }

                render() {
                    const listProps = {
                        page: this.state.page,
                        loading: this.state.loading,
                        pageSize: this.state.page_size,
                        data: this.state.data,
                        onPageSizeChange: this.onPageSizeChange.bind(this),
                        onPageChange: this.onPageChange
                    };

                    return (
                        <WrappedComponent
                            filterChange={this.filterChange}
                            reload={() => this.reload()}
                            getQuery={this.getQuery}
                            listProps={listProps}
                            {...this.props}
                        />);
                }
            });
}
