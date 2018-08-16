import React, {Component, Fragment} from "react";
import {getLabels} from "../../labels";
import Dialog from "../common/Dialog";
import TextFieldForm from "../form/TextFieldForm";
import {reduxForm} from "redux-form";
import {connect} from "react-redux";
import {getLabelFromOptions, getRoleLabel} from "../../helpers/user";
import Grid from "@material-ui/core/Grid";
import withProps from "../hoc/withProps";
import {clusterOptions, portal, workspaceOptions} from "../../helpers/props";
import {PORTALS} from "../../actions";
import Typography from "../../../node_modules/@material-ui/core/Typography";
import List from "../../../node_modules/@material-ui/core/List/List";
import ListItem from "../../../node_modules/@material-ui/core/ListItem/ListItem";
import Divider from "../../../node_modules/@material-ui/core/Divider/Divider";

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
        const {workspaceOptions, clusterOptions, portal} = this.props;

        return (
            <Fragment>
                <List disablePadding>
                    {prp_roles.map((item, idx) => {
                        let result = "";

                        if (item.cluster && portal === PORTALS.CLUSTER) {
                            result += getLabelFromOptions(clusterOptions, item.cluster);
                        }
                        else if (item.workspace) {
                            result += getLabelFromOptions(workspaceOptions, item.workspace);
                        }

                        if (result) {
                            result += " / ";
                        }

                        return <ListItem key={idx} disableGutters>{result + getRoleLabel(item.role)}</ListItem>;
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

export default connect(mapStateToProps)(withProps(workspaceOptions, clusterOptions, portal)((reduxForm({form: "myProfile"})(MyProfileDialog))));
