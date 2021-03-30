class CurrentWorkspaceDefault:

    workspace = None

    def set_context(self, serializer_field):
        from core.models import Workspace
        self.workspace = Workspace.objects.get(id=serializer_field.context['view'].kwargs['workspace_id'])

    def __call__(self):
        return self.workspace

    def __str__(self):
        return '{}()'.format(self.__class__.__name__)


def serialize_choices(choices):
    return [
        {
            'value': value,
            'label': label,
        } for value, label in choices
    ]
