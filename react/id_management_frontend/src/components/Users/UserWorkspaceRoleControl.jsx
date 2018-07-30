import React, {Component} from "react";
import {withStyles} from "@material-ui/core/styles";
import PropTypes from 'prop-types';
import {Typography} from "../../../node_modules/@material-ui/core";

const styleSheet = theme => ({
    role: {
        fontSize: 12,
        lineHeight: '24px',
        display: "inline-block",
    }
});

class UserWorkspaceRoleControl extends Component {
    render() {
        const {role, actions, classes} = this.props;

        return (
            <div>
                <Typography className={classes.role}>{role}</Typography>
                {actions}
            </div>
        );
    }
}

UserWorkspaceRoleControl.propTypes = {
    role: PropTypes.string.isRequired
}

export default withStyles(styleSheet)(UserWorkspaceRoleControl);
