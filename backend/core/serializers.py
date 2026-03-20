from rest_framework import serializers
from .models import PatientUser
import random
from django.db import IntegrityError
from django.db import models

class PatientUserSerializer(serializers.ModelSerializer):
    #We haven't gotten the required data for this field yet as we are actually getting random values for this field directly
    #when deserializing to add the python dictionary extracted from parsing the JSON to a model instance for PatientUser
    patient_id = serializers.IntegerField(required=False)
    class Meta:
        model=PatientUser
        fields=['patient_id','username','password','email']

    def create(self, validated_data):
        print("We are in this function!")
        idUnique = False
        user=PatientUser()
        print("Username: ", validated_data['username'])
        while idUnique == False:
            try:
                patient_id = random.randint(10000, 99999)
                user.username=validated_data['username']
                #set_password takes the password from the dictionary converted from JSON
                #applies the argon3 hashing technique on the password and store it in model
                user.set_password(validated_data['password'])
                user.email=validated_data['email']
                user.patient_id=patient_id
                idUnique = True
            except IntegrityError:
                continue
        user.save()
        return user

