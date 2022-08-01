import PropTypes from 'prop-types'
import React, {Component} from "react";
import Grid from "@material-ui/core/Grid";
import {green, grey, red} from "@material-ui/core/colors";
import {FiberManualRecord as Dot} from "@material-ui/icons";
import {USER_STATUS} from "../../constants";

const statusColor = {
    [USER_STATUS.ACTIVE]: green[500],
    [USER_STATUS.INVITED]: red[500],
    [USER_STATUS.INCOMPLETE]: grey[700],
};

const statusLabel = {
    [USER_STATUS.ACTIVE]: "Active",
    [USER_STATUS.INVITED]: "Invited",
    [USER_STATUS.INCOMPLETE]: "Inactive"
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
        const {row} = this.props;

        const inactiveAORole = row.prp_roles.find(role => role.role === 'IP_AUTHORIZED_OFFICER' && role.is_active === false);
        const status = inactiveAORole !== undefined || row.is_incomplete ? USER_STATUS.INCOMPLETE : row.status;

        return (
            <Grid container alignItems="center">
                <Grid item component={() => this.renderDot(status)}/>
                <Grid item>
                    {statusLabel[status]}
                </Grid>
            </Grid>
        )
    }
}

UserRowStatus.propTypes = {
    row: PropTypes.object.isRequired
};

export default UserRowStatus;

