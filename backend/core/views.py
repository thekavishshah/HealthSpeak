import random

from django.db import IntegrityError
from django.contrib.auth import get_user_model
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User

# Create your views here.
User = get_user_model()

@csrf_exempt
def processUser(request):
    if request.method == "POST":
        data = json.loads(request.body)
        user_firstName = data.get("firstName")
        user_lastName = data.get("lastName")
        user_email = data.get("email")
        user_password = data.get("password")
        idUnique = False
        
        while idUnique == False:
            try:
                patient_id = random.randint(10000, 99999)
        

                user = User.objects.create_user(
                    patient_id = patient_id,
                    username = (user_firstName + user_lastName).lower(),
                    email = user_email,
                    password=user_password
                )
                user.save()
            except IntegrityError:
                continue

        return JsonResponse({
            "message": "User created succesfully",
            "patient_id": patient_id})
    else:
        return JsonResponse({"error": "Invalid request"}, status=400)