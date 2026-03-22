from django.core.management.base import BaseCommand
from core.models import PatientUser


class Command(BaseCommand):
    help = 'Creates a default superuser for development (healthspeakAdmin)'

    def handle(self, *args, **options):
        username = 'healthspeakAdmin'
        password = 'sundevils123'
        email = 'admin@healthspeak.com'

        if PatientUser.objects.filter(username=username).exists():
            user = PatientUser.objects.get(username=username)
            # Ensure the user has the correct permissions and password
            user.set_password(password)
            user.is_superuser = True
            user.is_staff = True
            user.save()
            self.stdout.write(
                self.style.SUCCESS(
                    f'Superuser "{username}" already exists. Password updated and permissions verified.'
                )
            )
        else:
            PatientUser.objects.create_superuser(
                username=username,
                password=password,
                email=email
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f'Superuser "{username}" created successfully!'
                )
            )

        self.stdout.write(self.style.SUCCESS('\nLogin credentials:'))
        self.stdout.write(f'  Username: {username}')
        self.stdout.write(f'  Password: {password}')
        self.stdout.write(f'  Admin URL: http://localhost:8000/admin/')
