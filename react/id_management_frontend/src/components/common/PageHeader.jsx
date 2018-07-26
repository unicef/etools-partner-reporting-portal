import React, { Component } from "react";
import { Grid, Paper, Typography } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

const styleSheet = theme => ({
    header: {
        ...theme.mixins.gutters(),
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2
    }
});

class PageHeader extends Component {
    render() {
        const { children, classes } = this.props;

        return (
            <Paper square className={classes.header} elevation={1}>
                <Typography variant="headline">
                    <Grid justify="space-between" container alignItems="center">
                        {children}
                    </Grid>
                </Typography>
            </Paper>
        );
    }
}

export default withStyles(styleSheet)(PageHeader);
