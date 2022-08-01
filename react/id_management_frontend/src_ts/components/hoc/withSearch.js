import React, {Component} from 'react';
import qs from "query-string";
import {debounce} from "throttle-debounce";
import {expandedRowIds} from "../../actions";
import {connect} from "react-redux";
import {PORTAL_TYPE} from "../../constants";
import {computePermissions} from "../../helpers/permissions";
import * as R from 'ramda';

/*
    withSearch adds default search functionality to a component
    @param {function} getDataFn should provide data in a form presented below

    {
        count: Int,
        results: Array<Object>
    }

    @param {Object} defaultFilter

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
        portal_type: PORTAL_TYPE[state.portal],
        permissions: computePermissions(state)
    }
};

const mapDispatchToProps = dispatch => {
    return {
        resetExpandedRows: () => dispatch(expandedRowIds([]))
    }
};

export default (getDataFn, defaultFilter, defaultSorting) => {
    return WrappedComponent =>
        connect(mapStateToProps, mapDispatchToProps)(
            class WithSearch extends Component {
                constructor(props) {
                    super(props);

                    const sorting = this.parseOrdering(this.getQuery().ordering);

                    this.state = {
                        data: {
                            results: []
                        },
                        page: firstPage,
                        page_size: 10,
                        loading: false,
                        sorting: sorting || defaultSorting
                    };

                    this.filterChange = debounce(500, (filter) => {
                        this.onSearch(filter, firstPage);
                        props.resetExpandedRows();
                    });

                    this.getQuery = this.getQuery.bind(this);
                    this.reload = this.reload.bind(this);
                    this.onPageChange = this.onPageChange.bind(this);
                }

                isEmpty(query) {
                    return R.isEmpty(query);
                }

                reload(page, pageSize) {
                    this.onSearch(this.getQuery(), page, pageSize);
                }

                componentDidMount() {
                    this.reload();
                    this.props.resetExpandedRows();
                }

                getQuery() {
                    const query = qs.parse(this.props.history.location.search, {arrayFormat});

                    return this.isEmpty(query) ? Object.assign({}, defaultFilter, query) : query;
                }

                onSortingChange(order) {
                    this.setState({sorting: order}, () => {
                        this.reload();
                        this.props.resetExpandedRows();
                    });
                }

                onPageSizeChange(pageSize) {
                    this.reload(firstPage, pageSize);
                    this.props.resetExpandedRows();
                }

                onPageChange(page, pageSize) {
                    this.reload(page, pageSize);
                    this.props.resetExpandedRows();
                }

                parseOrdering(ordering) {
                    return ordering ? ordering.split(',').map(option => {
                        let sorting = {};

                        if (option.startsWith('-')) {
                            sorting.columnName = option.substring(1);
                            sorting.direction = 'desc';
                        }
                        else {
                            sorting.columnName = option;
                            sorting.direction = 'asc';
                        }

                        return sorting;
                    }) : null;
                }

                stringifySorting(sorting) {
                    return sorting ? sorting.map(option => {
                        let ordering = option.columnName;

                        if (option.direction === 'desc') {
                            ordering = `-${ordering}`;
                        }

                        return ordering;
                    }).join(',') : null;
                }

                onSearch(filter, page, pageSize) {
                    const {history, portal_type, permissions} = this.props;

                    let request = filter;

                    request.page = page || filter.page || this.state.page;
                    request.page_size = pageSize || filter.page_size || this.state.page_size;
                    request.ordering = this.stringifySorting(this.state.sorting);

                    this.setState({
                        page: parseInt(request.page, 10),
                        page_size: parseInt(request.page_size, 10),
                        loading: true
                    });

                    Promise.resolve(getDataFn(Object.assign({}, request, {
                        portal: portal_type
                    }), permissions))
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
                        sorting: this.state.sorting,
                        onPageSizeChange: this.onPageSizeChange.bind(this),
                        onPageChange: this.onPageChange,
                        onSortingChange: this.onSortingChange.bind(this)
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
