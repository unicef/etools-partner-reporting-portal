import React, {Component} from 'react';
import {NavLink} from 'react-router-dom';
import Group from "@material-ui/icons/Group";
import Business from "@material-ui/icons/Business";
import {connect} from "react-redux";
import {PORTALS} from "../../actions";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import {withStyles} from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import gray from "@material-ui/core/colors/grey";

const styleSheet = (theme) => ({
    'menuLink': {
        textDecoration: 'none',
        width: '100%',
        height: '100%',
        padding: '10px 16px',
        fontSize: '1rem',
        fontWeight: 500,
        color: theme.palette.text.primary,

        '&.active': {
            color: theme.palette.primary.dark,
            backgroundColor: gray[200]
        }
    },
    icon: {
        marginRight: 10
    },
    listItem: {
        padding: 0
    }
});

class MainMenu extends Component {
    render() {
        const {portal, match, classes} = this.props;

        const menuOptions = [
            {
                icon: Group,
                label: 'Users',
                url: match.url + '/users'
            },
            {
                icon: Business,
                label: 'Partners',
                url: match.url + '/partners',
                hide: portal === PORTALS.IP
            }
        ];

        const visibleOptions = menuOptions.map(
            (option, idx) => option.hide ? null :
                <ListItem key={idx} className={classes.listItem}>
                    <NavLink to={option.url} className={classes.menuLink}>
                        <Grid container alignItems="center">
                            <option.icon className={classes.icon}/>
                            {option.label}
                        </Grid>
                    </NavLink>
                </ListItem>
        );

        return (
            <List component="nav">
                {visibleOptions}
            </List>
        )
    }
}

const mapStateToProps = state => {
    return {
        portal: state.portal
    }
};

export default connect(mapStateToProps)(withStyles(styleSheet)(MainMenu));