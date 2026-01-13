"""
Patches for third-party packages to ensure Django 4.x compatibility.
This module applies patches during Django initialization (via settings.py).
"""
import os
import sys


def patch_file(filepath, old_text, new_text):
    try:
        with open(filepath, 'r') as f:
            content = f.read()

        if old_text in content:
            content = content.replace(old_text, new_text)
            with open(filepath, 'w') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        sys.stderr.write(f"Warning: Error patching {filepath}: {e}\n")
        return False


def apply_drfpasswordless_patch():
    """
    Patch drfpasswordless to work with Django 4.x by replacing
    ugettext_lazy with gettext_lazy.

    This patch is idempotent and safe to run multiple times.
    """
    try:
        import drfpasswordless

        # Check if already patched
        if hasattr(drfpasswordless, '_django4_patched'):
            return

        package_dir = os.path.dirname(drfpasswordless.__file__)

        serializers_file = os.path.join(package_dir, 'serializers.py')
        patch_file(
            serializers_file,
            'from django.utils.translation import ugettext_lazy as _',
            'from django.utils.translation import gettext_lazy as _'
        )

        for filename in os.listdir(package_dir):
            if filename.endswith('.py'):
                filepath = os.path.join(package_dir, filename)
                patch_file(
                    filepath,
                    'from django.utils.translation import ugettext_lazy',
                    'from django.utils.translation import gettext_lazy'
                )
                patch_file(
                    filepath,
                    'from django.utils.translation import ugettext',
                    'from django.utils.translation import gettext'
                )
        print("Patched drfpasswordless to work with Django 4.x")
        # Mark as patched
        drfpasswordless._django4_patched = True

    except ImportError:
        pass
    except Exception as e:
        sys.stderr.write(f"Warning: Could not apply drfpasswordless patch: {e}\n")
