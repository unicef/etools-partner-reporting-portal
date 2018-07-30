import React from 'react';
import {PRP_ROLE_OPTIONS} from "../../constants";
import SelectForm from "../form/SelectForm";
import {Grid, Typography} from "@material-ui/core";
import DeleteButton from "../common/DeleteButton";
import FieldsArrayItem from "../common/FieldsArrayItem";
import FieldsArrayPanel from "../common/FieldsArrayPanel";
import FieldsArrayAddButton from "../common/FieldsArrayAddButton";

const labels = {
    title: "Role per Workspace",
    workspace: "Workspace",
    role: "Role",
    addNew: "Add new",
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

const renderPermissionsFields = ({fields}) => (
    <div>
        <Typography variant="caption" gutterBottom>{labels.title}</Typography>

        <FieldsArrayPanel>
            {fields.map((item, index, fields) => (
                <FieldsArrayItem key={index}>
                    <Grid container justify="flex-end">
                        <Grid item>
                            <DeleteButton onClick={() => fields.remove(index)}/>
                        </Grid>
                    </Grid>

                    <Grid container spacing={24}>
                        <Grid item md={6}>
                            <SelectForm fieldName={`${item}.workspace`} label={labels.workspace}
                                        values={workspaceOptions}/>
                        </Grid>
                        <Grid item md={6}>
                            <SelectForm fieldName={`${item}.role`} label={labels.role}
                                        values={PRP_ROLE_OPTIONS}/>
                        </Grid>
                    </Grid>
                </FieldsArrayItem>
            ))}

            <FieldsArrayAddButton onClick={() => fields.push({})}/>
        </FieldsArrayPanel>
    </div>
);

export default renderPermissionsFields;