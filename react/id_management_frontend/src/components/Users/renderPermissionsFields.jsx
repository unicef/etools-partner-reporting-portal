import PropTypes from 'prop-types'
import React from 'react';
import {EDITABLE_PRP_ROLE_OPTIONS, USER_TYPE, USER_TYPE_ROLES} from "../../constants";
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
import {clusterForPartnerOptions, clusterOptions, portal, user, workspaceOptions} from "../../helpers/props";

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

const renderPermissionsFields = ({selectedUser, fields, portal, workspaceOptions, user, clusterForPartnerOptions, clusterOptions}) => {
    let showAdd;

    if (portal === PORTALS.IP) {
        showAdd = fields.length < workspaceOptions.length;
    }
    else if (clusterForPartnerOptions.length && selectedUser.user_type === "PARTNER") {
        showAdd = fields.length < clusterForPartnerOptions.length;
    } else {
        showAdd = fields.length < clusterOptions.length;
    }

    return (
        <div>
            <Typography variant="caption" gutterBottom>{title[portal]}</Typography>

            <FieldsArrayPanel>
                {fields.map((item, index, fields) => {
                    const field = fields.get(index);

                    const selectedClusters = getSelectedOptions("cluster", fields, index);
                    const selectedWorkspaces = getSelectedOptions("workspace", fields, index);
                    const filteredWorkspaceOptions = filterOptionsValues(workspaceOptions, selectedWorkspaces);
                    const filteredClusterOptions = filterOptionsValues(clusterForPartnerOptions, selectedClusters);
                    const filteredClusters = filterOptionsValues(clusterOptions, selectedClusters);

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

                        const userType = selectedUser.user_type || (selectedUser.partner ? USER_TYPE.PARTNER : USER_TYPE.IMO);

                        if (portal === PORTALS.CLUSTER) {
                            roleOptions = roleOptions.filter(option => USER_TYPE_ROLES[userType].indexOf(option.value) > -1);
                        }
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
                                                      options={filteredWorkspaceOptions}
                                                      maxMenuHeight={maxMenuHeight}/>}

                                    {portal === PORTALS.CLUSTER && clusterForPartnerOptions.length > 0 && selectedUser.user_type === "PARTNER" &&
                                    <SearchSelectForm fieldName={`${item}.cluster`} label={labels.cluster}
                                                      options={filteredClusterOptions} maxMenuHeight={maxMenuHeight}/>}

                                    {portal === PORTALS.CLUSTER && clusterOptions.length > 0 && !clusterForPartnerOptions.length &&
                                    <SearchSelectForm fieldName={`${item}.cluster`} label={labels.cluster}
                                                      options={filteredClusters} maxMenuHeight={maxMenuHeight}/>}
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

                {showAdd &&
                <FieldsArrayAddButton onClick={() => fields.push({})}/>}
            </FieldsArrayPanel>
        </div>
    )
};

renderPermissionsFields.propTypes = {
    fields: PropTypes.any.isRequired,
    portal: PropTypes.string,
    selectedUser: PropTypes.object,
    clusterForPartnerOptions: PropTypes.array.isRequired,
    clusterOptions: PropTypes.array.isRequired,
    user: PropTypes.object,
    workspaceOptions: PropTypes.array
};

export default withProps(clusterForPartnerOptions, clusterOptions, workspaceOptions, portal, user)(renderPermissionsFields);

