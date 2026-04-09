from django.contrib import admin
from .models import PatientUser, MedicalTerms

# Register your models here.
admin.site.register(PatientUser)
admin.site.register(MedicalTerms)