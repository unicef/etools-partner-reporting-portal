import PropTypes from 'prop-types'
import React, {Component} from "react";
import ProfileButton from "./ProfileButton";
import {Menu, MenuItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {AccountCircle, PowerSettingsNew} from "@material-ui/icons";
import withMenu from "../../hoc/withMenu";
import withDialogHandling from "../../hoc/withDialogHandling";
import MyProfileDialog from "../MyProfileDialog";
import {logout} from "../../../helpers/user";

class ProfileMenu extends Component {
    constructor(props) {
        super(props);

        this.options = [
            {
                icon: AccountCircle,
                label: "Profile",
                action: () => {
                    props.handleDialogOpen("myProfile");
                    props.handleClose();
                }
            },
            {
                icon: PowerSettingsNew,
                label: "Sign out",
                action: logout
            }
        ];
    }

    render() {
        const {anchorEl, handleClick, handleClose, dialogOpen, handleDialogClose} = this.props;

        return (
            <div>
                <ProfileButton onClick={handleClick}/>

                <Menu
                    id="profile-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    {this.options.map((option, idx) => (
                        <MenuItem key={idx} onClick={option.action}>
                            <ListItemIcon>
                                <option.icon/>
                            </ListItemIcon>
                            <ListItemText inset primary={option.label}/>
                        </MenuItem>
                    ))}
                </Menu>

                <MyProfileDialog open={dialogOpen.myProfile} onClose={handleDialogClose}/>
            </div>
        );
    }
}

ProfileMenu.propTypes = {
    anchorEl: PropTypes.any,
    dialogOpen: PropTypes.object.isRequired,
    handleClick: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleDialogClose: PropTypes.func.isRequired,
    handleDialogOpen: PropTypes.func.isRequired
};

export default withDialogHandling(withMenu(ProfileMenu));

