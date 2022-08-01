import PropTypes from 'prop-types'
import React, {Component, Fragment} from "react";
import {getLabels} from "../../labels";
import Dialog from "../common/Dialog";
import TextFieldForm from "../form/TextFieldForm";
import {reduxForm} from "redux-form";
import {connect} from "react-redux";
import Grid from "@material-ui/core/Grid";
import withProps from "../hoc/withProps";
import {portal} from "../../helpers/props";
import {PORTALS} from "../../actions";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List/List";
import ListItem from "@material-ui/core/ListItem/ListItem";
import Divider from "@material-ui/core/Divider/Divider";

const title = "My Profile";

const labels = getLabels({
    myRoles: "My roles"
});

class MyProfileDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            roleLabel: ''
        };

        this.renderPrpRoles = this.renderPrpRoles.bind(this);
    }

    renderPrpRoles(prp_roles) {
        const {portal} = this.props;

        return (
            <Fragment>
                <List disablePadding>
                    {prp_roles.map((item, idx) => {
                        let result = "";

                        if (item.cluster && portal === PORTALS.CLUSTER) {
                            result += item.cluster.full_title;
                        }
                        else if (item.workspace) {
                            result += item.workspace.title;
                        }

                        if (result) {
                            result += " / ";
                        }

                        return <ListItem key={idx} disableGutters>{result + item.role_display}</ListItem>;
                    })}
                </List>
                <Divider/>
            </Fragment>
        )
    }

    render() {
        const {open, onClose, prp_roles} = this.props;

        const textFieldProps = {
            disabled: true,
            inputProps: {
                style: {
                    color: "black"
                }
            }
        };

        return (
            <Dialog
                open={open}
                onClose={onClose}
                title={title}
            >
                <Grid container spacing={24}>
                    <Grid item xs={12}>
                        <TextFieldForm fieldName="first_name" label={labels.firstName} textFieldProps={textFieldProps}/>

                    </Grid>
                    <Grid item xs={12}>
                        <TextFieldForm fieldName="last_name" label={labels.lastName} textFieldProps={textFieldProps}/>

                    </Grid>
                    <Grid item xs={12}>
                        <TextFieldForm fieldName="email" label={labels.email} textFieldProps={textFieldProps}/>

                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="caption" gutterBottom>{labels.myRoles}</Typography>
                        {this.renderPrpRoles(prp_roles)}
                    </Grid>
                    <Grid item xs={12}>
                        <TextFieldForm fieldName="partner" label={labels.partner} textFieldProps={textFieldProps}/>
                    </Grid>
                </Grid>
            </Dialog>
        );
    }
}

const mapStateToProps = (state) => {
    const {first_name, last_name, email, partner, prp_roles} = state.user;

    return {
        initialValues: {
            first_name,
            last_name,
            email,
            partner: partner ? partner.title : '-',
        },
        prp_roles
    }
};

MyProfileDialog.propTypes = {
    clusterOptions: PropTypes.array,
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool,
    portal: PropTypes.string,
    prp_roles: PropTypes.array,
    workspaceOptions: PropTypes.array
};

export default connect(mapStateToProps)(withProps(portal)((reduxForm({form: "myProfile"})(MyProfileDialog))));

