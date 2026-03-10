from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import AbstractUser
import json

# Create your models here.
#Models.model parameter is not needed because when we create a user and pass it to this model, this User will anyway we stored in the model
class PatientUser(AbstractUser):
    patient_id = models.IntegerField(
        unique=True,
        validators=[
            MinValueValidator(10000),
            MaxValueValidator(99999)
        ]
    )
class MedicalTerms(models.Model):
    term = models.TextField(unique=True)

class Symptom(models.Model):
    termId = models.ManyToManyField(MedicalTerms)
    symptom_name = models.CharField(max_length=255)

class Definition(models.Model):
    termId = models.ManyToManyField(MedicalTerms)
    termDef = models.TextField()

class SearchHistory(models.Model):
    searchByUser = models.ForeignKey(PatientUser, on_delete=models.CASCADE)
    term_id = models.ForeignKey(MedicalTerms, on_delete=models.CASCADE)


    #Start with 3 symptoms, 3 causes, 3 related terms for each term
    #Once that works, expand overtime
