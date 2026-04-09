from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import json

# Create your models here.
#Models.model parameter is not needed because when we create a user and pass it to this model, this User will anyway we stored in the model
class PatientUser(AbstractUser):
    #Set this to null and blank since this isn't required as input. 
    #Is automically assigned a value by the serializer
    #For admin, these parameters are needed because we are also a user, but the admin of the database
    patient_id = models.IntegerField(
        unique=True,
        validators=[
            MinValueValidator(10000),
            MaxValueValidator(99999)
        ],
        null=True,
        blank=True
    )
class MedicalTerms(models.Model):
    user_term = models.CharField(max_length=255, unique=True, default = "")
    cui = models.CharField(max_length=50, unique=True, default = "")
    full_term = models.CharField(max_length=255, default = "")
    term_data = models.JSONField(default=dict)

""" We can use this later for production with  first Normal form when dealing with many entries
class Symptom(models.Model):
    termId = models.ForeignKey(MedicalTerms, on_delete = models.CASCADE)
    symptom_name = models.CharField(max_length=255)

class Definition(models.Model):
    termId = models.ForeignKey(MedicalTerms, on_delete = models.CASCADE)
    termDef = models.TextField()
"""
class SearchHistory(models.Model):
    searchByUser = models.ForeignKey(PatientUser, on_delete=models.CASCADE)
    term_id = models.ForeignKey(MedicalTerms, on_delete=models.CASCADE)
    search_time = models.DateTimeField(default=timezone.now)
    updated_time = models.DateTimeField(auto_now=True)


    #Start with 3 symptoms, 3 causes, 3 related terms for each term
    #Once that works, expand overtime
