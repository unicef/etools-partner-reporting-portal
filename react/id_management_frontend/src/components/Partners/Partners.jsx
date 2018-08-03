import React, {Component} from 'react';
import PageHeader from "../common/PageHeader";
import ButtonNew from "../common/ButtonNew";
import withDialogHandling from "../hoc/withDialogHandling";
import AddPartnerDialog from "./AddPartnerDialog";

const header = "Partners";

class Partners extends Component {
    render() {
        const {dialogOpen, handleDialogOpen, handleDialogClose} = this.props;

        return (
            <div>
                <PageHeader>
                    {header} <ButtonNew onClick={() => handleDialogOpen('addPartner')}/>
                </PageHeader>

                <AddPartnerDialog open={dialogOpen.addPartner} onClose={handleDialogClose}/>
            </div>
        )
    }
}

export default withDialogHandling(Partners);