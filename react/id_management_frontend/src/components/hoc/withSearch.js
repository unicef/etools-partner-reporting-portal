import React, {Component} from 'react';
import qs from "query-string";
import {debounce} from "throttle-debounce";

const firstPage = 1;

export default (getDataFn) =>
    WrappedComponent =>
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
                });

                this.getQuery = this.getQuery.bind(this);
            }

            reload(page, pageSize) {
                this.onSearch(this.getQuery(), page, pageSize);
            }

            componentDidMount() {
                this.reload();
            }

            getQuery() {
                return qs.parse(this.props.history.location.search);
            }

            onPageSizeChange(pageSize) {
                this.reload(firstPage, pageSize);
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
                    onPageChange: this.reload.bind(this)
                };

                return (
                    <WrappedComponent
                        filterChange={this.filterChange}
                        getQuery={this.getQuery}
                        listProps={listProps}
                        {...this.props}
                    />);
            }
        };
