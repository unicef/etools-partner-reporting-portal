import weakref

from django.contrib.auth.models import Group


class GroupWrapper:
    code = None
    name = None
    _group = None
    _instances = []

    def __init__(self, code, name, create_group=False):
        self.__class__._instances.append(weakref.proxy(self))
        self.name = name
        self.code = code

        if create_group:
            self.as_group()

    def __str__(self):
        return self.name

    def as_group(self):
        if not self._group:
            self._group, _ = Group.objects.get_or_create(name=self.name)
        return self._group

    def as_choice(self):
        return self.code, self.name

    def __eq__(self, other):
        if isinstance(other, Group):
            return other.name == self.name

        if isinstance(other, str):
            return other == self.code or other == self.name

        if self is other:
            return True

        return super() == other

    def invalidate_cache(self):
        self._group = None

    @classmethod
    def invalidate_instances(cls):
        for instance in cls._instances:
            instance.invalidate_cache()
