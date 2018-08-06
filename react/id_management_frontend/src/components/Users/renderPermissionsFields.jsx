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
import withWorkspaceOptions from "../hoc/withWorkspaceOptions";
import withUser from "../hoc/withUser";
import {userRoleInCluster, userRoleInWorkspace} from "../../helpers/user";
import withClusterOptions from "../hoc/withClusterOptions";
import {PORTALS} from "../../actions";

const title = {
    [PORTALS.IP]: "Role per Workspace",
    [PORTALS.CLUSTER]: "Role per Cluster"
};

const renderPermissionsFields = ({fields, portal, workspaceOptions, user, clusterOptions}) => (
    <div>
        <Typography variant="caption" gutterBottom>{title[portal]}</Typography>

        <FieldsArrayPanel>
            {fields.map((item, index, fields) => {
                const field = fields.get(index);

                let role;

                if (portal === PORTALS.IP) {
                    role = userRoleInWorkspace(user, field.workspace);
                }
                else {
                    role = userRoleInCluster(user, field.cluster)
                }


                const roleOptions = role ? EDITABLE_PRP_ROLE_OPTIONS[role] : [];

                return (
                    <FieldsArrayItem key={index}>
                        <Grid container justify="flex-end">
                            <Grid item>
                                <DeleteButton onClick={() => fields.remove(index)}/>
                            </Grid>
                        </Grid>

                        <Grid container spacing={24}>
                            <Grid item md={6}>
                                {portal === PORTALS.IP &&
                                <SelectForm fieldName={`${item}.workspace`} label={labels.workspace}
                                            values={workspaceOptions}/>}

                                {portal === PORTALS.CLUSTER &&
                                <SelectForm fieldName={`${item}.cluster`} label={labels.cluster}
                                            values={clusterOptions}/>}
                            </Grid>

                            <Grid item md={6}>
                                <SelectForm fieldName={`${item}.role`} label={labels.role}
                                            values={roleOptions}/>
                            </Grid>
                        </Grid>
                    </FieldsArrayItem>
                )
            })}

            <FieldsArrayAddButton onClick={() => fields.push({})}/>
        </FieldsArrayPanel>
    </div>
);

export default withClusterOptions(withWorkspaceOptions(withPortal(withUser(renderPermissionsFields))));