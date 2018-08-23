import React, {Component} from "react";
import {withStyles} from "@material-ui/core/styles";
import {CircularProgress} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import PropTypes from "prop-types";

const styleSheet = () => ({
    absolute: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -20,
        marginTop: -20
    }
});

class LoadingIndicator extends Component {
    render() {
        const {classes, absolute} = this.props;

        return (
            <Grid container spacing={24} justify="center" alignItems="center">
                <Grid item>
                    <CircularProgress className={absolute ? classes.absolute : ""}/>
                </Grid>
            </Grid>
        );
    }
}

LoadingIndicator.propTypes = {
    absolute: PropTypes.bool,
    classes: PropTypes.object.isRequired
};

export default withStyles(styleSheet)(LoadingIndicator);
