from rest_framework import serializers
from .models import PatientUser, MedicalTerms
import random
from django.db import IntegrityError, transaction

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

class TermDataSerializer(serializers.ModelSerializer):
    class Meta:
        model=MedicalTerms
        fields=['user_term', 'cui' ,'full_term','term_data']
    
    @transaction.atomic
    def create(self, validated_data):
        instance, created = MedicalTerms.objects.get_or_create(
            user_term = validated_data["user_term"],
            cui = validated_data["cui"],
            defaults={
                'full_term': validated_data['full_term'],
                'term_data': validated_data['term_data'],
            }
        )
        #Since get_or_create when we need to create the instance aleady saves it in the database
        #Just return the instance
        return instance
