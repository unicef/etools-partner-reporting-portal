from openpyxl.reader.excel import load_workbook
from openpyxl.styles import Font, Alignment

from django.conf import settings

import itertools

from indicator.models import Disaggregation, DisaggregationValue

PATH = settings.BASE_DIR + "/apps/cluster/templates/excel/export.xlsx"
SAVE_PATH = settings.MEDIA_ROOT + '/'

class XLSXWriter:
    def __init__(self, indicators):

        self.wb = load_workbook(PATH)
        self.sheet = self.wb.get_active_sheet()
        self.indicators = indicators


    def duplicate_sheet(self, sheet):
        return self.wb.copy_worksheet(sheet)

    def export_data(self):

        MOVE_COLUMN = 0


        # Disaggregation types
        # TODO: At this moment fake data is wrong. Disaggregation should be unique and shared.
        # Workaround: I use super slow distinct to prepare excel file
        disaggregation_types_base = Disaggregation.objects.all().distinct('name')
        disaggregation_types_base_length = len(disaggregation_types_base)

        # Split data into spreadsheets, combination of disaggregation_types_length with r-length tuples and no repeated elements
        spreadsheet_disaggregation_types_list = list(itertools.combinations(range(0, disaggregation_types_base_length), disaggregation_types_base_length - 1))
        spreadsheet_disaggregation_types_list.append(tuple(i for i in range(0, disaggregation_types_base_length)))

        # TODO: remove! Mapping current fake data to unique Disaggregation ID
        disaggregation_types_map = dict()

        # Generate headers for disaggregation
        for dt in range(disaggregation_types_base_length):
            self.sheet.cell(row=1, column=28 + dt).value = disaggregation_types_base[dt].name
            self.sheet.cell(row=1, column=28 + dt).alignment = Alignment(horizontal='center')
            self.sheet.cell(row=1, column=28 + dt).font = Font(bold=True)
            disaggregation_types_map[disaggregation_types_base[dt].name] = 28 + dt

        # Generate spreadsheets
        sheets = [self.sheet, ]
        sheets[0].title = str(spreadsheet_disaggregation_types_list[0])
        for i in range(1, len(spreadsheet_disaggregation_types_list)):
            sheets.append(self.duplicate_sheet(self.sheet))
            sheets[i].title = str(spreadsheet_disaggregation_types_list[i])

        # Generate name of spreadsheets
        sheet_no = 0
        for types in spreadsheet_disaggregation_types_list:
            title = list()
            for t in types:
                title.append(disaggregation_types_base[t].name)
            sheets[sheet_no].title = "Cluster (%s) " % ",".join(title)
            sheet_no += 1

        # List of processed indicator locations (IndicatorLocationData)
        processed_indicator_locations = list()


        # iterate over disaggregation_types combinations
        sheet_no = 0
        for spreadsheet_disaggregation_type in spreadsheet_disaggregation_types_list:
            self.sheet = sheets[sheet_no]

            disaggregation_types = list()
            for i in spreadsheet_disaggregation_type:
                disaggregation_types.append(disaggregation_types_base[i])

            disaggregation_types_spreadsheet= [dt.name for dt in disaggregation_types]

            disaggregation_types_length = len(disaggregation_types)

            start_row_id = 4

            # disaggregation_values_list is list that holds unique Disaggregation values per Disaggregation type
            disaggregation_values_list = list()
            disaggregation_values_length = 0
            for disaggregation_type in disaggregation_types:
                disaggregation_values = DisaggregationValue.objects.filter(disaggregation=disaggregation_type).order_by('value').distinct('value')
                disaggregation_values_list.append(disaggregation_values)
                disaggregation_values_length += len(disaggregation_values)

            # disaggregation_values is a list that stores ALL possible combinations
            disaggregation_values = list()

            # disaggregation_values_dict is a dictionary that stores column number where key is group of disaggregation_values ids
            disaggregation_values_dict = dict()

            # Generate all possible combinations (max. 3 items per combination) for disaggregation values
            for combination_items in range(1, 4):
                for combinations in itertools.combinations(disaggregation_values_list, combination_items):
                    disaggregation_values += list(itertools.product(*combinations))

            # Generate headers for disaggregation values
            for dv in range(len(disaggregation_values)):
                ids = ",".join([str(disaggregation_value.id) for disaggregation_value in disaggregation_values[dv]])
                values = " + ".join([disaggregation_value.value for disaggregation_value in disaggregation_values[dv]])
                self.sheet.cell(row=1, column=28 + disaggregation_types_base_length + dv).value = values
                self.sheet.cell(row=1, column=28 + disaggregation_types_base_length + dv).alignment = Alignment(horizontal='center')
                self.sheet.cell(row=1, column=28 + disaggregation_types_base_length + dv).font = Font(bold=True)
                self.sheet.cell(row=2, column=28 + disaggregation_types_base_length + dv).value = ids
                disaggregation_values_dict[values] = 28 + disaggregation_types_base_length + dv
                if dv == len(disaggregation_values) - 1:
                    self.sheet.cell(row=1, column=28 + disaggregation_types_base_length + dv).value = "Total"
                    disaggregation_values_dict[""] = 28 + disaggregation_types_base_length + dv

            # MOVE_COLUMN += len(disaggregation_types)
            # MOVE_COLUMN += len(disaggregation_values)

            for indicator in self.indicators:
                cluster_objective = indicator.reportable.cluster_objectives.first()
                cluster_activity = indicator.reportable.cluster_activities.first()
                partner_project = indicator.reportable.partner_projects.first()
                partner_activity = indicator.reportable.partner_activities.first()
                locations_data = indicator.indicator_location_data

                cluster = None

                if cluster_objective:
                    cluster = cluster_objective.cluster
                    partner_activity = cluster_objective.cluster_activities.first().partner_activities.first()
                    partner_project = cluster_objective.cluster.partner_projects.first()
                elif cluster_activity:
                    cluster = cluster_activity.cluster_objective.cluster
                    cluster_objective = cluster_activity.cluster_objective
                    partner_activity = cluster_activity.partner_activities.first()
                    partner_project = cluster_activity.cluster_objective.cluster.partner_projects.first()
                elif partner_activity:
                    cluster = partner_activity.cluster_activity.cluster_objective.cluster
                    cluster_objective = partner_activity.cluster_activity.cluster_objective
                    partner_project = partner_activity.project
                elif partner_project:
                    cluster = partner_project.clusters.first()
                    cluster_objective = partner_project.clusters.first().cluster_objectives.first()
                    partner_activity = partner_project.partner.partner_activities.first()

                # Each row is one location per indicator
                for location_data in locations_data.all():
                    # Check if we already processed this data
                    if location_data.id in processed_indicator_locations:
                        continue

                    disaggregation_exists_in_spreadsheet = True

                    # TODO: Update below when we have unique disaggregation data
                    # Disaggregation type
                    disaggragations_column_to_add = list()
                    for dt in Disaggregation.objects.filter(id__in=location_data.disaggregation_reported_on):
                        if dt.name not in disaggregation_types_spreadsheet:
                            disaggregation_exists_in_spreadsheet = False
                            break
                        else:
                            disaggragations_column_to_add.append(disaggregation_types_map[dt.name])

                    if not disaggregation_exists_in_spreadsheet:
                        continue
                    else:
                        for column in disaggragations_column_to_add:
                            self.sheet.cell(row=start_row_id, column=column).value = "X"
                        processed_indicator_locations.append(location_data.id)

                    self.sheet.cell(row=start_row_id, column=1).value = cluster.title
                    self.sheet.cell(row=start_row_id, column=2).value = cluster.partner_projects.first().partner.title
                    self.sheet.cell(row=start_row_id, column=3).value = cluster_objective.title
                    self.sheet.cell(row=start_row_id, column=4).value = partner_activity.title
                    self.sheet.cell(row=start_row_id, column=5).value = indicator.reportable.blueprint.title
                    self.sheet.cell(row=start_row_id, column=6).value = partner_project.title
                    self.sheet.cell(row=start_row_id, column=7).value = partner_project.get_status_display()
                    self.sheet.cell(row=start_row_id, column=8).value = partner_activity.start_date
                    self.sheet.cell(row=start_row_id, column=9).value = partner_activity.end_date

                    self.sheet.cell(row=start_row_id, column=10).value = indicator.reportable.baseline
                    self.sheet.cell(row=start_row_id, column=11).value = indicator.reportable.target
                    self.sheet.cell(row=start_row_id, column=12).value = indicator.reportable.total['c']

                    self.sheet.cell(row=start_row_id, column=13).value =location_data.location.title
                    self.sheet.cell(row=start_row_id, column=14).value = location_data.location.p_code
                    self.sheet.cell(row=start_row_id, column=15).value = "XXX" # TODO: no field here!

                    self.sheet.cell(row=start_row_id, column=16).value = indicator.time_period_start
                    self.sheet.cell(row=start_row_id, column=17).value = indicator.time_period_end

                    self.sheet.cell(row=start_row_id, column=18).value = indicator.get_overall_status_display()

                    self.sheet.cell(row=start_row_id, column=19 + MOVE_COLUMN).value = indicator.submission_date
                    self.sheet.cell(row=start_row_id, column=20 + MOVE_COLUMN).value = cluster.id
                    self.sheet.cell(row=start_row_id, column=21 + MOVE_COLUMN).value = cluster_objective.id
                    self.sheet.cell(row=start_row_id, column=22 + MOVE_COLUMN).value = partner_activity.id
                    self.sheet.cell(row=start_row_id, column=23 + MOVE_COLUMN).value = indicator.reportable.blueprint.id
                    self.sheet.cell(row=start_row_id, column=24 + MOVE_COLUMN).value = partner_project.partner.id
                    self.sheet.cell(row=start_row_id, column=25 + MOVE_COLUMN).value = partner_project.id
                    self.sheet.cell(row=start_row_id, column=26 + MOVE_COLUMN).value = indicator.id
                    self.sheet.cell(row=start_row_id, column=27 + MOVE_COLUMN).value = location_data.id

                    # Iterate over disaggregation
                    for k, v in location_data.disaggregation.items():
                        if eval(k):
                            dvs = DisaggregationValue.objects.filter(id__in=eval(k))
                            name = " + ".join([dv.value for dv in dvs])
                            if name in disaggregation_values_dict:
                                self.sheet.cell(row=start_row_id, column=disaggregation_values_dict[name]).value = v['c']
                        if k == "()":
                            self.sheet.cell(row=start_row_id, column=disaggregation_values_dict['']).value = v['c']

                    start_row_id += 1
            sheet_no += 1

        filepath = SAVE_PATH + 'export.xlsx'
        self.wb.save(filepath)
        return filepath