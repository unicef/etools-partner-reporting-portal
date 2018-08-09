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
    CustomPaging, EditingState,
} from '@devexpress/dx-react-grid';
import {RowDetailState} from "@devexpress/dx-react-grid";
import {withStyles} from "@material-ui/core/styles";
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {connect} from 'react-redux';
import {expandedRowIds} from "../../actions";
import IconButton from "@material-ui/core/IconButton";
import Delete from "@material-ui/icons/Delete";
import LoadingIndicator from "./LoadingIndicator";

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

const DeleteButton = ({onExecute}) => (
    <IconButton onClick={onExecute} title="Delete row">
        <Delete/>
    </IconButton>
);

const commandComponents = {
    delete: DeleteButton,
};

const Command = ({id, onExecute}) => {
    const CommandButton = commandComponents[id];
    return (
        <CommandButton
            onExecute={onExecute}
        />
    );
};

const editCell = (deleteCondition) => (props) => {
    const {row} = props;

    return deleteCondition(row) ? <TableEditRow.Cell {...props} onValueChange={() => {}} /> : <Table.Cell/>;
};

class PaginatedList extends Component {
    constructor(props) {
        super(props);

        this.commitChanges = this.commitChanges.bind(this);
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

    commitChanges({deleted}) {
        const {onDelete, data: {results}} = this.props;

        onDelete(results[deleted[0]]);
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
            dispatchExpandedRowIds,
            showDelete,
            deleteCondition
        } = this.props;

        const containerClasses = classNames(
            classes.container,
            {
                [classes.loading]: loading
            }
        );

        return (
            <Paper className={containerClasses}>
                <Grid rows={data.results} columns={columns}>
                    {this.header()}

                    <PagingState
                        currentPage={page - 1}
                        onCurrentPageChange={(page) => onPageChange(page + 1)}
                        pageSize={pageSize}
                        onPageSizeChange={onPageSizeChange}
                    />
                    <CustomPaging
                        totalCount={data.count}
                    />

                    {showDelete &&
                    <EditingState
                        onCommitChanges={this.commitChanges}
                    />}

                    <Table/>
                    <TableHeaderRow/>
                    <RowDetailState expandedRowIds={expandedRowIds}
                                    onExpandedRowIdsChange={dispatchExpandedRowIds}/>

                    <TableRowDetail
                        contentComponent={({row}) => expandedCell(row)}
                    />

                    {showDelete &&
                    <TableEditColumn
                        width={64}
                        showDeleteCommand
                        commandComponent={Command}
                        cellComponent={editCell(deleteCondition)}
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
    data: PropTypes.object.isRequired,
    expandedCell: PropTypes.func,
    page: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func,
    showDelete: PropTypes.bool,
    deleteCondition: PropTypes.func
};

const mapStateToProps = (state) => {
    const {expandedRowIds} = state;

    return {
        expandedRowIds
    };
};

const mapDispatchToProps = dispatch => {
    return {
        dispatchExpandedRowIds: ids => dispatch(expandedRowIds(ids))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styleSheet)(PaginatedList));
