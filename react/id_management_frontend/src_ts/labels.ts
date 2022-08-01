const labels = {
    workspace: "Workspace",
    role: "Role",
    cancel: "Cancel",
    save: "Save",
    addNew: "Add new",
    cluster: "Cluster",
    partner: "Partner",
    search: "Search",
    firstName: "First name",
    lastName: "Last name",
    email: "E-mail",
    none: "None",
    phone_number: "Phone number",
    partnerType: "Partner type",
    userType: "User type",
    status: "Status"
};

export function getLabels(localLabels: Object) {
    return Object.assign({}, labels, localLabels);
}

export default labels;
