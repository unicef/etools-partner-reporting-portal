import React, {Component} from "react";
import {withStyles} from "@material-ui/core/styles";
import LoadingIndicator from "../common/LoadingIndicator";
import {getLabels} from "../../labels";
import partnerLabels from "./partnerLabels";
import {Grid} from "@material-ui/core";
import SmallValue from "../common/SmallValue";
import {connect} from "react-redux";
import PropTypes from "prop-types";

const labels = getLabels(partnerLabels);

const styleSheet = (theme) => ({
    container: {
        padding: `${theme.spacing.unit}px 0`,
        position: 'relative'
    }
});

const renderFields = [
    "ocha_external_id",
    "external_id",
    "external_source",
    "short_title",
    "alternate_title",
    "shared_partner",
    "cso_type",
    "email",
    "phone_number",
    "street_address",
    "city",
    "postal_code",
    "country_code",
    "total_ct_cp",
    "total_ct_cy",
    "vendor_number",
    "alternate_id",
    "rating",
    "type_of_assessment",
    "basis_for_risk_rating"
];

class PartnerRowExpanded extends Component {
    constructor(props) {
        super(props);
        this.renderField = this.renderField.bind(this);
    }

    renderField(fieldName, idx) {
        const {data} = this.props;

        return data[fieldName] ?
            <Grid item md={6} key={idx}>
                <SmallValue label={labels[fieldName]} value={data[fieldName + "_display"] || data[fieldName]}/>
            </Grid> : null
    }

    render() {
        const {classes, data} = this.props;

        return (
            <div className={classes.container}>
                <Grid container>
                    <Grid item md={6}>
                        <Grid container spacing={8}>
                            {!!data &&
                            renderFields.map(this.renderField)}
                        </Grid>
                    </Grid>
                </Grid>

                {!data &&
                <LoadingIndicator/>}
            </div>
        );
    }
}

PartnerRowExpanded.propTypes = {
    classes: PropTypes.object.isRequired,
    data: PropTypes.object,
    row: PropTypes.object.isRequired
};

const mapStateToProps = (state, ownProps) => {
    return {
        data: state.partnerDetails[ownProps.row.id]
    }
};

export default connect(mapStateToProps)(withStyles(styleSheet)(PartnerRowExpanded));
