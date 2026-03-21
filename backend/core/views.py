from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
#from rest_framework.decorators import api_view
from rest_framework.parsers import JSONParser
from .serializers import PatientUserSerializer
from .models import PatientUser
from django.core.mail import send_mail


@csrf_exempt
#Aternative way to write API endpoints
#@api_view(["POST"])
def processUser(request):
    print("We are in the function!")
    try:
        if request.method == "GET":
            #we use requests.GET to get all the attibutes or parameters included in the GET request as a dictionary
            #we use get method in Python to get a value of the key, where the parameter names are the keys and their values are the values
            patient_id = request.GET.get("patient_id")
            print(patient_id)
            modelData = PatientUser.objects.get(patient_id=patient_id)
            if not modelData:
                return JsonResponse({"error": "User not found"}, status=404)
            serializer = PatientUserSerializer(modelData)
            return JsonResponse(serializer.data, status=200)
        if request.method == "POST":
            #This takes the request body, the JSON string object, and converts it to a Python dictionary
            #If we use the api_view, we actually do not need this. Only including it to understand the workflow better
            data = JSONParser().parse(request)
            print(data)
            data["username"] = data.pop("firstName") + data.pop("lastName")
            serializer = PatientUserSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                print(serializer.validated_data)
                user_instance = serializer.instance
                
                send_mail(
                    "HealthSpeak Account Created Succesfully",
                    f"Hello! Here is your patient id: {user_instance.patient_id}",
                    'healthspeakdonotreply@example.com',
                    [user_instance.email]
                )
                return JsonResponse({
                    "message": "User created succesfully",
                }, status=201)
            else:
                #Used to see if tthere are any specifi erros when creating the serializer object and validating all the fields
                #print("We never created data instance!", serializer.errors)
                return JsonResponse({"error": "400 Invalid request"}, status=400)
    except:
        return JsonResponse({"error": " Internal Server Error"}, status=500)

    #Alternative to not using serializer for backend validation, conversion of JSON 
    # to a instance of a database model and returning jSON response
    """
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
                idUnique = True
            except IntegrityError:
                continue

        return JsonResponse({
            "message": "User created succesfully",
            "patient_id": patient_id})
    else:
        return JsonResponse({"error": "Invalid request"}, status=400)
    """