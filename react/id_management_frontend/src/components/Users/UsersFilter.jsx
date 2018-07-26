import React, {Component} from "react";
import GreyPanel from "../common/GreyPanel";
import Grid from "@material-ui/core/Grid";
import FilterButtons from "../common/FilterButtons";
import {reduxForm} from 'redux-form';
import TextFieldForm from "../form/TextFieldForm";
import SelectForm from "../form/SelectForm";

const labels = {
    search: "Search",
    searchPlaceholder: "Name or Email",
    workspace: "Workspace",
    role: "Role"
};

const workspaceOptions = [
    {
        label: "Workspace 1",
        value: 1
    },
    {
        label: "Workspace 2",
        value: 2
    }
];

const roleOptions = [
    {
        label: "Role 1",
        value: 1
    },
    {
        label: "Role 2",
        value: 2
    }
];

class UsersFilter extends Component {
    render() {
        const {reset} = this.props;

        return (
            <GreyPanel>
                <form noValidate>
                    <Grid container spacing={24}>
                        <Grid item md={4}>
                            <TextFieldForm fieldName="name_email" label={labels.search}
                                           placeholder={labels.searchPlaceholder}
                                           margin="none" optional/>
                        </Grid>
                        <Grid item md={4}>
                            <SelectForm fieldName="workspaces" label={labels.workspace} values={workspaceOptions}
                                        optional multiple/>
                        </Grid>
                        <Grid item md={4}>
                            <SelectForm fieldName="roles" label={labels.role} values={roleOptions}
                                        optional multiple/>
                        </Grid>
                    </Grid>

                    <FilterButtons onClear={reset}/>
                </form>
            </GreyPanel>
        );
    }
}

export default reduxForm({form: 'usersFilter'})(UsersFilter);
