import PropTypes from 'prop-types'
import React from 'react';
import {EDITABLE_PRP_ROLE_OPTIONS} from "../../constants";
import SelectForm from "../form/SelectForm";
import SearchSelectForm from "../form/SearchSelectForm";
import {Grid, Typography} from "@material-ui/core";
import DeleteButton from "../common/DeleteButton";
import FieldsArrayItem from "../common/FieldsArrayItem";
import FieldsArrayPanel from "../common/FieldsArrayPanel";
import FieldsArrayAddButton from "../common/FieldsArrayAddButton";
import labels from "../../labels";
import {userRoleInCluster, userRoleInWorkspace} from "../../helpers/user";
import {PORTALS} from "../../actions";
import {filterOptionsValues} from "../../helpers/options";
import withProps from "../hoc/withProps";
import {clusterOptions, workspaceOptions, portal, user} from "../../helpers/props";

const title = {
    [PORTALS.IP]: "Role per Workspace",
    [PORTALS.CLUSTER]: "Role per Cluster"
};

const getSelectedOptions = (optionName, fields, index) => {
    let options = [];

    fields.forEach((item, idx, fields) => {
        if (idx !== index && fields.get(idx)[optionName]) {
            options.push(fields.get(idx)[optionName]);
        }
    });

    return options;
};

const renderPermissionsFields = ({selectedUser, fields, portal, workspaceOptions, user, clusterOptions}) => {
    return (
        <div>
            <Typography variant="caption" gutterBottom>{title[portal]}</Typography>

            <FieldsArrayPanel>
                {fields.map((item, index, fields) => {
                    const field = fields.get(index);

                    const selectedClusters = getSelectedOptions("cluster", fields, index);
                    const selectedWorkspaces = getSelectedOptions("workspace", fields, index);
                    const filteredWorkspaceOptions = filterOptionsValues(workspaceOptions, selectedWorkspaces);
                    const filteredClusterOptions = filterOptionsValues(clusterOptions, selectedClusters);

                    let role;

                    if (portal === PORTALS.IP) {
                        role = userRoleInWorkspace(user, field.workspace);
                    }
                    else {
                        role = userRoleInCluster(user, field.cluster)
                    }

                    let roleOptions = [];

                    if (role) {
                        roleOptions = EDITABLE_PRP_ROLE_OPTIONS[role] || [];
                    }

                    const maxMenuHeight = 120;

                    return (
                        <FieldsArrayItem key={index}>
                            <Grid container justify="flex-end">
                                <Grid item>
                                    {fields.length > 1 &&
                                    <DeleteButton onClick={() => fields.remove(index)}/>}
                                </Grid>
                            </Grid>

                            <Grid container spacing={24}>
                                <Grid item md={6}>
                                    {portal === PORTALS.IP &&
                                    <SearchSelectForm fieldName={`${item}.workspace`} label={labels.workspace}
                                                      options={filteredWorkspaceOptions} maxMenuHeight={maxMenuHeight}/>}

                                    {portal === PORTALS.CLUSTER &&
                                    <SearchSelectForm fieldName={`${item}.cluster`} label={labels.cluster}
                                                      options={filteredClusterOptions} maxMenuHeight={maxMenuHeight}/>}
                                </Grid>

                                <Grid item md={6}>
                                    <SelectForm fieldName={`${item}.role`} label={labels.role}
                                                values={roleOptions}
                                                selectFieldProps={{disabled: !roleOptions.length}}/>
                                </Grid>
                            </Grid>
                        </FieldsArrayItem>
                    )
                })}

                <FieldsArrayAddButton onClick={() => fields.push({})}/>
            </FieldsArrayPanel>
        </div>
    )
};

renderPermissionsFields.propTypes = {
    clusterOptions: PropTypes.array,
    fields: PropTypes.any.isRequired,
    portal: PropTypes.string,
    selectedUser: PropTypes.object,
    user: PropTypes.object,
    workspaceOptions: PropTypes.array
};

export default withProps(clusterOptions, workspaceOptions, portal, user)(renderPermissionsFields);

