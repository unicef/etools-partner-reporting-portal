import React, {Component} from 'react';
import qs from "query-string";
import {debounce} from "throttle-debounce";
import {expandedRowIds} from "../../actions";
import {connect} from "react-redux";

const firstPage = 1;

const mapDispatchToProps = dispatch => {
    return {
        resetExpandedRows: () => dispatch(expandedRowIds([]))
    }
};

export default (getDataFn) => {
    return WrappedComponent =>
        connect(null, mapDispatchToProps)(
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
                    return qs.parse(this.props.history.location.search);
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
                    let request = filter;

                    request.page = page || filter.page || this.state.page;
                    request.page_size = pageSize || filter.page_size || this.state.page_size;

                    this.setState({
                        page: parseInt(request.page),
                        page_size: parseInt(request.page_size),
                        loading: true
                    });

                    Promise.resolve(getDataFn(request))
                        .then(data => this.setState({data, loading: false}));

                    const {history} = this.props;

                    history.push({
                        pathname: history.location.pathname,
                        search: qs.stringify(request)
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
                            reload={this.reload}
                            getQuery={this.getQuery}
                            listProps={listProps}
                            {...this.props}
                        />);
                }
            });
}
