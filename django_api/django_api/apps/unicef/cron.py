from django_cron import CronJobBase, Schedule

from core.api import PMP_API


class ProgrammeDocumentCronJob(CronJobBase):
    RUN_AT_TIMES = ['0:10']

    schedule = Schedule(run_at_times=RUN_AT_TIMES)
    code = 'partner.ProgrammeDocumentCronJob'    # a unique code


    def do(self):
        """
        Specifically each below expected_results instance has the following
        mapping.

        From this need to create indicator blueprint first, then disagg,
        then PDResultLink, then LL output, then Reportable attached to that LLO.
        {
            id: 8,                  --> LLO.external_id
            title: "blah",          --> LLO.title
            result_link: 47,        --> PDResultLink.external_id
            cp_output: {
                id: 312,            --> PDResultLink.external_cp_output_id
                title: "1.1 POLICY - NEWBORN & CHILD HEALTH"    --> PDResultLink.title
            },
            indicators: [ ]
        }
        """
        api = PMP_API()
        # DO some stuff
        print api.programme_documents()
