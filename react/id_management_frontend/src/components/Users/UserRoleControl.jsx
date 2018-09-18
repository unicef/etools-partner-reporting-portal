import React, {Component} from "react";
import PropTypes from 'prop-types';
import {PORTALS} from "../../actions";
import withProps from "../hoc/withProps";
import {portal} from "../../helpers/props";
import SmallValue from "../common/SmallText";

const inactive = "Deactivated";

class UserRoleControl extends Component {
    render() {
        const {role, actions, portal} = this.props;

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

        if (!role.is_active) {
            text += ` (${inactive})`;
        }

        return (
            <div>
                <SmallValue gutterBottom>{text}</SmallValue>
                {actions}
            </div>
        );
    }
}

UserRoleControl.propTypes = {
    actions: PropTypes.any,
    portal: PropTypes.string,
    role: PropTypes.object.isRequired
};

export default withProps(portal)(UserRoleControl);
