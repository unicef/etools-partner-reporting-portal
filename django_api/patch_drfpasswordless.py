#!/usr/bin/env python
"""
Patch drfpasswordless to work with Django 4.x by replacing ugettext_lazy with gettext_lazy
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
            print(f"✓ Patched {filepath}")
            return True
        else:
            print(f"- No changes needed in {filepath}")
            return False
    except Exception as e:
        print(f"✗ Error patching {filepath}: {e}")
        return False

def main():
    try:
        import drfpasswordless
        package_dir = os.path.dirname(drfpasswordless.__file__)
    except ImportError:
        print("✗ drfpasswordless not installed")
        sys.exit(1)

    print(f"Found drfpasswordless at: {package_dir}")

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

    print("✓ Patching complete!")

if __name__ == '__main__':
    main()
