import React, { Component } from "react";
import { Paper } from "@material-ui/core";
import {
    Grid,
    Table,
    TableHeaderRow,
    TableRowDetail
} from "@devexpress/dx-react-grid-material-ui";
import { RowDetailState } from "@devexpress/dx-react-grid";
import { withStyles } from "@material-ui/core/styles";

const styleSheet = (theme) => ({
    container: {
        marginTop: theme.spacing.unit * 3
    }
});

class PaginatedList extends Component {
    render() {
        const { columns, items, expandedCell, classes } = this.props;

        return (
            <Paper className={classes.container}>
                <Grid rows={items} columns={columns}>
                    <Table />
                    <TableHeaderRow />
                    <RowDetailState />
                    <TableRowDetail
                        contentComponent={({ row }) => expandedCell(row)}
                    />
                </Grid>
            </Paper>
        );
    }
}

export default withStyles(styleSheet)(PaginatedList);
