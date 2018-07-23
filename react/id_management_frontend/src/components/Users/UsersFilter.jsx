import React, { Component } from "react";
import GreyPanel from "../common/GreyPanel";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import MenuSelect from "../common/MenuSelect";
import FilterInput from "../common/FilterInput";
import FilterButtons from "../common/FilterButtons";

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
    state = {
        search: "",
        workspace: "",
        role: ""
    };

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleClear = event => {
        this.setState({
            search: "",
            workspace: "",
            role: ""
        });
    };

    render() {
        return (
            <GreyPanel>
                <form noValidate>
                    <Grid container spacing={24}>
                        <Grid item md={4}>
                            <FilterInput>
                                <TextField
                                    value={this.state.search}
                                    onChange={this.handleChange}
                                    id="search"
                                    name="search"
                                    label={labels.search}
                                    placeholder={labels.searchPlaceholder}
                                    margin="none"
                                />
                            </FilterInput>
                        </Grid>
                        <Grid item md={4}>
                            <MenuSelect
                                value={this.state.workspace}
                                onChange={this.handleChange}
                                label={labels.workspace}
                                name="workspace"
                                options={workspaceOptions}
                                nullable
                            />
                        </Grid>
                        <Grid item md={4}>
                            <MenuSelect
                                value={this.state.role}
                                onChange={this.handleChange}
                                label={labels.role}
                                name="role"
                                options={roleOptions}
                                nullable
                            />
                        </Grid>
                    </Grid>

                    <FilterButtons onClear={this.handleClear} />
                </form>
            </GreyPanel>
        );
    }
}

export default UsersFilter;
