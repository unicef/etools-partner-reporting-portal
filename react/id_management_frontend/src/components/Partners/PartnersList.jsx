import React, {Component} from "react";
import PaginatedList from "../common/PaginatedList";
import PartnerRowExpanded from "./PartnerRowExpanded";


class PartnersList extends Component {
    getColumns() {
        return [
            {
                title: "Partner",
                name: "title"
            },
            {
                title: "Partner Type",
                name: "partner_type_display"
            },
            {
                title: "Clusters",
                name: "clusters",
                getCellValue: row => row.clusters.map(cluster => cluster.title).join(", ")
            }
        ];
    }

    render() {
        return (
            <div>
                <PaginatedList
                    {...this.props}
                    showEdit
                    columns={this.getColumns()}
                    expandedCell={row => (
                        <PartnerRowExpanded row={row}/>
                    )}
                />
            </div>
        );
    }
}

export default PartnersList;
