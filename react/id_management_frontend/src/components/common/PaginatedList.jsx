import React, {Component} from "react";
import {Paper, Typography} from "@material-ui/core";
import {
    Grid,
    Table,
    TableHeaderRow,
    TableRowDetail,
    PagingPanel,
    TableEditColumn,
    TableEditRow
} from "@devexpress/dx-react-grid-material-ui";
import {
    PagingState,
    CustomPaging,
    EditingState,
    SortingState,
} from '@devexpress/dx-react-grid';
import {RowDetailState} from "@devexpress/dx-react-grid";
import {withStyles} from "@material-ui/core/styles";
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {connect} from 'react-redux';
import {expandedRowIds} from "../../actions";
import IconButton from "@material-ui/core/IconButton";
import Close from "@material-ui/icons/Close";
import Edit from "@material-ui/icons/Edit";
import Restore from "@material-ui/icons/SettingsBackupRestore";
import LoadingIndicator from "./LoadingIndicator";
import orange from "@material-ui/core/colors/orange";

const allowedPageSizes = [5, 10, 15];

const styleSheet = (theme) => {
    const paddingSmall = theme.spacing.unit * 2;
    const paddingBig = theme.spacing.unit * 3;

    return {
        container: {
            marginTop: paddingBig,
            position: 'relative'
        },
        loading: {
            backgroundColor: theme.palette.grey[200],
            pointerEvents: 'none'
        },
        header: {
            padding: `${paddingSmall}px 0 ${paddingSmall}px ${paddingBig}px`,
        }
    }
};

const highlightStyle = {
    backgroundColor: orange[100]
};

const TableRow = ({row, ...restProps}) => (
    <Table.Row
        {...restProps}
        style={row.highlight ? highlightStyle : {}}
    />
);

const DeleteButton = ({onClick}) => (
    <IconButton onClick={onClick} title="Delete row">
        <Close/>
    </IconButton>
);

const EditButton = ({onClick}) => (
    <IconButton onClick={onClick} title="Edit row">
        <Edit/>
    </IconButton>
);

const RestoreButton = ({onClick}) => (
    <IconButton onClick={onClick} title="Restore row">
        <Restore/>
    </IconButton>
);

export class PaginatedList extends Component {
    constructor(props) {
        super(props);

        this.onExpandedRowIdsChange = this.onExpandedRowIdsChange.bind(this);
        this.sortingChange = this.sortingChange.bind(this);

        this.editCell = (showEdit, showDelete, showRestore) => (props) => {
            const {row} = props;
            const {onEdit, onDelete, onRestore} = this.props;

            return (
                <TableEditRow.Cell onValueChange={() => {
                }}>
                    {showEdit && <EditButton onClick={() => onEdit(row)}/>}
                    {showDelete && row.canBeDeleted && <DeleteButton onClick={() => onDelete(row)}/>}
                    {showRestore && row.canBeRestored && <RestoreButton onClick={() => onRestore(row)}/>}
                </TableEditRow.Cell>
            )
        }
    }

    header() {
        const {data: {count}, classes, page, pageSize} = this.props;

        const resultsFrom = (page - 1) * pageSize + 1;
        const resultsTo = Math.min(resultsFrom + pageSize - 1, count);

        return (
            <div className={classes.header}>
                <Typography variant="headline">
                    {`${resultsFrom}-${resultsTo} of ${count} results to show`}
                </Typography>
            </div>
        );
    }

    onExpandedRowIdsChange(ids) {
        const {dispatchExpandedRowIds} = this.props;

        dispatchExpandedRowIds(ids);

        if (this.props.onExpandedRowIdsChange) {
            this.props.onExpandedRowIdsChange(ids);
        }
    }

    generateSortingOptions(columnNames, direction) {
        return columnNames.map(columnName => ({
            columnName,
            direction
        }));
    }

    sortingChange(sorting) {
        const {onSortingChange, alternativeSorting} = this.props;

        if (alternativeSorting) {
            let result = sorting.slice();

            for (let i = result.length - 1; i > -1; i--) {
                alternativeSorting.forEach(option => {
                    if (option.columnName === result[i].columnName) {
                        result.splice(i, 1, ...this.generateSortingOptions(option.orderingNames, result[i].direction))
                    }
                });
            }

            onSortingChange(result);
        }
        else {
            onSortingChange(sorting);
        }
    }

    computeInnerSorting(sorting) {
        const {alternativeSorting} = this.props;

        if (alternativeSorting) {
            let result = sorting.slice();

            alternativeSorting.forEach(option => {
                option.orderingNames.forEach((name, idx) => {
                    let found = result.findIndex(item => item.columnName === name);

                    if (found > -1) {
                        if (idx === option.orderingNames.length - 1) {
                            result.splice(found, 1, ...this.generateSortingOptions([option.columnName], result[found].direction))
                        }
                        else {
                            result.splice(found, 1);
                        }
                    }
                })
            });

            return result;
        }

        return sorting;
    }

    render() {
        const {
            columns,
            data,
            expandedCell,
            classes,
            page,
            onPageChange,
            pageSize,
            onPageSizeChange,
            loading,
            expandedRowIds,
            showDelete,
            showEdit,
            showRestore,
            sorting,
            columnExtensions,
            allowSorting
        } = this.props;

        const containerClasses = classNames(
            classes.container,
            {
                [classes.loading]: loading
            }
        );

        const innerSorting = this.computeInnerSorting(sorting);

        return (
            <Paper className={containerClasses}>
                <Grid rows={data.results} columns={columns}>
                    {this.header()}

                    <SortingState
                        sorting={innerSorting}
                        onSortingChange={this.sortingChange}
                        columnExtensions={columnExtensions}
                    />

                    <PagingState
                        currentPage={page - 1}
                        onCurrentPageChange={(page) => onPageChange(page + 1)}
                        pageSize={pageSize}
                        onPageSizeChange={onPageSizeChange}
                    />
                    <CustomPaging
                        totalCount={data.count}
                    />

                    {(showDelete || showEdit || showRestore) &&
                    <EditingState
                        onCommitChanges={() => {
                        }}
                    />}

                    <Table rowComponent={TableRow}/>
                    <TableHeaderRow showSortingControls={allowSorting}/>
                    <RowDetailState expandedRowIds={expandedRowIds}
                                    onExpandedRowIdsChange={this.onExpandedRowIdsChange}/>

                    <TableRowDetail
                        contentComponent={({row}) => expandedCell(row)}
                    />

                    {(showDelete || showEdit || showRestore) &&
                    <TableEditColumn
                        width={64}
                        cellComponent={this.editCell(showEdit, showDelete, showRestore)}
                    />}

                    <PagingPanel pageSizes={allowedPageSizes}/>
                    {loading && <LoadingIndicator absolute/>}
                </Grid>
            </Paper>
        );
    }
}

PaginatedList.propTypes = {
    columns: PropTypes.array.isRequired,
    columnExtensions: PropTypes.array,
    alternativeSorting: PropTypes.array,
    data: PropTypes.object.isRequired,
    expandedCell: PropTypes.func,
    page: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func,
    showDelete: PropTypes.bool,
    showRestore: PropTypes.bool,
    allowSorting: PropTypes.bool,
    loading: PropTypes.bool,
    onEdit: PropTypes.func,
    showEdit: PropTypes.bool,
    onExpandedRowIdsChange: PropTypes.func,
    classes: PropTypes.object.isRequired
};

export const mapStateToProps = (state) => {
    const {expandedRowIds} = state;

    return {
        expandedRowIds
    };
};

export const mapDispatchToProps = dispatch => {
    return {
        dispatchExpandedRowIds: ids => dispatch(expandedRowIds(ids))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styleSheet)(PaginatedList));
