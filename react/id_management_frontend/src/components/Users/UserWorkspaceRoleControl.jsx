import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from 'prop-types';
import { Typography } from "../../../node_modules/@material-ui/core";

const styleSheet = theme => ({
    role: {
        fontSize: 12,
        lineHeight: '24px'
    }, 
    action: {
        display: "inline-block", 
        marginLeft: 10
    }
});

class UserWorkspaceRoleControl extends Component {
    render() {
        const { role, action, classes } = this.props;

        return (
            <div>
                <Typography className={classes.role}>{role}</Typography>
                {action && <action className={classes.action} />}
            </div>
        );
    }
}

UserWorkspaceRoleControl.propTypes = {
    role: PropTypes.string.isRequired
}

export default withStyles(styleSheet)(UserWorkspaceRoleControl);
