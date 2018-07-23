import React, { Component } from "react";
import ProfileButton from "./ProfileButton";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { AccountCircle, PowerSettingsNew } from "@material-ui/icons";
import withMenu from "../../hoc/withMenu";

const options = [
    {
        icon: AccountCircle,
        label: "Profile"
    },
    {
        icon: PowerSettingsNew,
        label: "Sign out"
    }
];

class ProfileMenu extends Component {
    render() {
        const { anchorEl, handleClick, handleClose } = this.props;

        return (
            <div>
                <ProfileButton onClick={handleClick} />

                <Menu
                    id="profile-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    {options.map((option, idx) => (
                        <MenuItem key={idx} onClick={handleClose}>
                            <ListItemIcon>
                                <option.icon />
                            </ListItemIcon>
                            <ListItemText inset primary={option.label} />
                        </MenuItem>
                    ))}
                </Menu>
            </div>
        );
    }
}

export default withMenu(ProfileMenu);
