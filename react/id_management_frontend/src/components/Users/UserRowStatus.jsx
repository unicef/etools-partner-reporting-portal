import PropTypes from 'prop-types'
import React, {Component} from "react";
import Grid from "@material-ui/core/Grid";
import {green, grey, red} from "@material-ui/core/colors";
import {FiberManualRecord as Dot} from "@material-ui/icons";
import {withStyles} from "@material-ui/core/styles";


const statusColor = {
    ACTIVE: green[500],
    INVITED: red[500],
    DEACTIVATED: grey[900],
    INCOMPLETE: red[500]
};

const statusLabel = {
    ACTIVE: "Active",
    INVITED: "Invited",
    DEACTIVATED: "Deactivated",
    INCOMPLETE: "No roles assigned"
};

const styleSheet = theme => {
    return {
        incomplete: {
            color: theme.palette.secondary.main,
            display: "inline-block",
            marginLeft: theme.spacing.unit * 0.5
        }
    }
};

class UserRowStatus extends Component {
    renderDot(status) {
        const dotStyle = {
            color: statusColor[status],
            fontSize: '16px',
            marginRight: 5
        };

        return <Dot style={dotStyle}/>
    }

    render() {
        const {row, classes} = this.props;

        return (
            <Grid container alignItems="center">
                <Grid item component={() => this.renderDot(row.status)}/>
                <Grid item>
                    {statusLabel[row.status]}
                    {row.is_incomplete &&
                        <span className={classes.incomplete}>{`(${statusLabel["INCOMPLETE"]})`}</span>}
                </Grid>
            </Grid>
        )
    }
}

UserRowStatus.propTypes = {
    classes: PropTypes.object.isRequired,
    row: PropTypes.object.isRequired
};

export default withStyles(styleSheet)(UserRowStatus);

