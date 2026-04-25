import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User

# Try to get the admin user, or create it if it doesn't exist
admin_user, created = User.objects.get_or_create(
    username='admin',
    defaults={'email': 'admin@example.com'}
)

if created:
    admin_user.set_password('admin123')
    admin_user.is_superuser = True
    admin_user.is_staff = True

# Force the role to be ADMIN (Fixes the default='STUDENT' issue)
admin_user.role = 'ADMIN'
admin_user.save()

if created:
    print("Superuser 'admin' created successfully with password 'admin123' and role 'ADMIN'.")
else:
    print("Superuser 'admin' updated to have role 'ADMIN'.")
