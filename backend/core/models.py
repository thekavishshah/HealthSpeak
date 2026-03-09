from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import AbstractUser
import json

# Create your models here.
#Models.model parameter is not needed because when we create a user and pass it to this model, this User will anyway we stored in the model
class Users(AbstractUser):
    patient_id = models.IntegerField(
        primary_key=True,
        validators=[
            MinValueValidator(10000),
            MaxValueValidator(99999)
        ]
    )

class medicalTerms(models.Model):
    term = models.TextField(unique=true)
    definition = models.TextField()

    #Start with 3 symptoms, 3 causes, 3 related terms for each term
    #Once that works, expand overtime
