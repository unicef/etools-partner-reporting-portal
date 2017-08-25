from openpyxl.reader.excel import load_workbook

from django.conf import settings

PATH = settings.BASE_DIR + "/apps/cluster/templates/excel/export.xlsx"
SAVE_PATH = settings.MEDIA_ROOT + '/'

class XLSXWriter:
    def __init__(self, indicators):

        self.wb = load_workbook(PATH)
        self.sheet = self.wb.get_active_sheet()
        self.indicators = indicators

    def export_data(self):

        row_id = 4

        for indicator in self.indicators:

            cluster_objective = indicator.reportable.cluster_objectives.first()
            cluster_activity = indicator.reportable.cluster_activities.first()
            partner_project = indicator.reportable.partner_projects.first()
            partner_activity = indicator.reportable.partner_activities.first()

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


            self.sheet.cell(row=row_id, column=1).value = cluster.title
            self.sheet.cell(row=row_id, column=2).value = cluster.partner_projects.first().partner.title
            self.sheet.cell(row=row_id, column=3).value = cluster_objective.title
            self.sheet.cell(row=row_id, column=4).value = partner_activity.title
            self.sheet.cell(row=row_id, column=5).value = indicator.reportable.blueprint.title
            self.sheet.cell(row=row_id, column=6).value = partner_project.title
            self.sheet.cell(row=row_id, column=7).value = partner_project.get_status_display()
            self.sheet.cell(row=row_id, column=8).value = partner_activity.start_date
            self.sheet.cell(row=row_id, column=9).value = partner_activity.end_date

            self.sheet.cell(row=row_id, column=10).value = indicator.reportable.baseline
            self.sheet.cell(row=row_id, column=11).value = indicator.reportable.target
            self.sheet.cell(row=row_id, column=12).value = indicator.reportable.total['c']

            self.sheet.cell(row=row_id, column=16).value = indicator.time_period_start
            self.sheet.cell(row=row_id, column=17).value = indicator.time_period_end


            row_id += 1

        filepath = SAVE_PATH + 'export.xlsx'
        self.wb.save(filepath)
        return filepath