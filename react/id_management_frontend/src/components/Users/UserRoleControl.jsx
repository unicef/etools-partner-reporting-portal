import React, {Component} from "react";
import {withStyles} from "@material-ui/core/styles";
import PropTypes from 'prop-types';
import {Typography} from "../../../node_modules/@material-ui/core";
import withPortal from "../hoc/withPortal";
import {PORTALS} from "../../actions";

const styleSheet = theme => ({
    role: {
        fontSize: 12,
        lineHeight: '24px',
        display: "inline-block",
    }
});

class UserRoleControl extends Component {
    render() {
        const {role, actions, classes, portal} = this.props;

        let text = "";

        switch (portal) {
            case PORTALS.IP:
                text += role.workspace ? `${role.workspace.title} / ` : '';
                break;
            default:
                text += role.cluster ? `${role.cluster.full_title} / ` : '';
                break;
        }

        text += role.role_display;

        return (
            <div>
                <Typography className={classes.role}>{text}</Typography>
                {actions}
            </div>
        );
    }
}

UserRoleControl.propTypes = {
    role: PropTypes.object.isRequired
};

export default withPortal(withStyles(styleSheet)(UserRoleControl));
