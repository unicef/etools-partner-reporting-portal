import PropTypes from 'prop-types'
import React, {Component} from "react";
import {NavLink} from "react-router-dom";
import Group from "@material-ui/icons/Group";
import Business from "@material-ui/icons/Business";
import {PORTALS} from "../../actions";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import {withStyles} from "@material-ui/core/styles";
import {Typography, Grid} from "@material-ui/core";
import withProps from "../hoc/withProps";
import {portal, user} from "../../helpers/props";
import {hasPartnersAccess} from "../../helpers/user";

const styleSheet = theme => ({
    menuLink: {
        textDecoration: "none",
        width: "100%",
        height: "100%",
        padding: "10px 16px",
        color: theme.palette.text.primary,

        "&.active": {
            color: theme.palette.primary.main,
            backgroundColor: theme.palette.common.grey
        }
    },
    icon: {
        marginRight: theme.spacing.unit * 2
    },
    listItem: {
        padding: 0
    }
});

class MainMenu extends Component {
    render() {
        const {portal, match, classes, user} = this.props;

        const menuOptions = [
            {
                icon: Group,
                label: "Users",
                url: match.url + "/users"
            },
            {
                icon: Business,
                label: "Partners",
                url: match.url + "/partners",
                hide: portal === PORTALS.IP || !hasPartnersAccess(user)
            }
        ];

        const visibleOptions = menuOptions.map(
            (option, idx) =>
                option.hide ? null : (
                    <ListItem key={idx} className={classes.listItem}>
                        <NavLink to={option.url} className={classes.menuLink}>
                            <Grid container alignItems="center">
                                <option.icon className={classes.icon}/>
                                <Typography variant="body2" color="inherit">
                                    {option.label}
                                </Typography>
                            </Grid>
                        </NavLink>
                    </ListItem>
                )
        );

        return <List component="nav">{visibleOptions}</List>;
    }
}

MainMenu.propTypes = {
    classes: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    portal: PropTypes.string,
    user: PropTypes.object
};

export default withProps(portal, user)(withStyles(styleSheet)(MainMenu));

