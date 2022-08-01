import React, {Component} from "react";
import {Paper, Typography, Button, Grid} from "@material-ui/core";
import PaddedContent from "../common/PaddedContent";
import {withStyles} from "@material-ui/core/styles";
import PropTypes from "prop-types";


const styleSheet = (theme) => {
    return {
        container: {
            marginBottom: theme.spacing.unit * 3,
        }
    }
};

const message = "There is at least one other authorized officer in your workspace(s).";

class AoAlert extends Component {
    render() {
        const {classes, onClick} = this.props;

        return (
            <Paper elevation={1} className={classes.container}>
                <PaddedContent>
                    <Grid container justify="space-between" alignItems="center">
                        <Typography variant="title" color="textSecondary">
                            {message}
                        </Typography>
                        <Button color="primary" onClick={onClick}>Click here to see them</Button>
                    </Grid>
                </PaddedContent>
            </Paper>
        )
    }
}

AoAlert.propTypes = {
    classes: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired
};

export default withStyles(styleSheet)(AoAlert);