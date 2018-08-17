import React, {Component} from "react";
import {withStyles} from "@material-ui/core/styles";
import ButtonClear from "./ButtonClear";
import Grid from "@material-ui/core/Grid";
import PropTypes from "prop-types";

const styleSheet = theme => ({
    filterButtons: {
        marginTop: theme.spacing.unit * 2
    }
});

class FilterButtons extends Component {
    render() {
        const {classes, onClear} = this.props;

        return (
            <Grid container justify="flex-end" className={classes.filterButtons}>
                <Grid item>
                    <ButtonClear onClick={onClear}/>
                </Grid>
            </Grid>
        );
    }
}

FilterButtons.propTypes = {
    classes: PropTypes.object.isRequired,
    onClear: PropTypes.func.isRequired
};

export default withStyles(styleSheet)(FilterButtons);
