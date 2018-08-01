import React from 'react';
import {EDITABLE_PRP_ROLE_OPTIONS} from "../../constants";
import SelectForm from "../form/SelectForm";
import {Grid, Typography} from "@material-ui/core";
import DeleteButton from "../common/DeleteButton";
import FieldsArrayItem from "../common/FieldsArrayItem";
import FieldsArrayPanel from "../common/FieldsArrayPanel";
import FieldsArrayAddButton from "../common/FieldsArrayAddButton";
import labels from "../../labels";
import withPortal from "../hoc/withPortal";

const title = "Role per Workspace";

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

const renderPermissionsFields = ({fields, portal}) => (
    <div>
        <Typography variant="caption" gutterBottom>{title}</Typography>

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
                                        values={EDITABLE_PRP_ROLE_OPTIONS[portal]}/>
                        </Grid>
                    </Grid>
                </FieldsArrayItem>
            ))}

            <FieldsArrayAddButton onClick={() => fields.push({})}/>
        </FieldsArrayPanel>
    </div>
);

export default withPortal(renderPermissionsFields);