import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import ButtonClear from "./ButtonClear";
import Grid from "@material-ui/core/Grid";

const styleSheet = theme => ({
    filterButtons: {
        marginTop: theme.spacing.unit * 2
    }
});

class ButtonNew extends Component {
    render() {
        const { classes, onClear } = this.props;

        return (
            <Grid container justify="flex-end" className={classes.filterButtons}>
                <Grid item>
                    <ButtonClear onClick={onClear} />
                </Grid>
            </Grid>
        );
    }
}

export default withStyles(styleSheet)(ButtonNew);
