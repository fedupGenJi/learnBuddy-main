from rest_framework.decorators import api_view
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from rest_framework.response import Response
from django.core.mail import send_mail
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

from core.models import Temp, UserDetail, Score

from core.models import Temp
from core.utils import generate_otp
import json
import requests

@api_view(["POST"])
def signup_user(request):
    name = request.data.get("name")
    email = request.data.get("email")
    password1 = request.data.get("password1")
    password2 = request.data.get("password2")

    if not all([name, email, password1, password2]):
        return Response({"error": "All fields are required"}, status=400)

    if password1 != password2:
        return Response({"error": "Passwords do not match"}, status=400)
    
    if UserDetail.objects.filter(email=email).exists():
        return Response({"error": "This email is already registered. Please login."}, status=400)

    if Temp.objects.filter(email=email).exists():
        return Response({"error": "You have already started signup. Please check your email for OTP."}, status=400)

    otp = generate_otp()

    hashed_password = make_password(password1)

    Temp.objects.create(
        name=name,
        email=email,
        password=hashed_password,
        otp=otp
    )

    send_mail(
        subject="Your LearnBuddy OTP Code",
        message=f"Your OTP is: {otp}",
        from_email=None,  
        recipient_list=[email],
    )

    return Response({"message": "OTP sent successfully"}, status=200)

@api_view(["POST"])
def verify_otp(request):
    email = request.data.get("email")
    otp = request.data.get("otp")

    try:
        temp_user = Temp.objects.get(email=email)

        if temp_user.otp != otp:
            return Response({"error": "Invalid OTP"}, status=400)

        user_detail = UserDetail.objects.create(
            name=temp_user.name,
            email=temp_user.email,
            password=temp_user.password,
            score=0.0 
        )

        Score.objects.create(id=user_detail)  

        temp_user.delete()

        return Response({"message": "Account created successfully"}, status=200)

    except Temp.DoesNotExist:
        return Response({"error": "User not found in temp table"}, status=404)

@api_view(["POST"])
def login_user(request):
    email = request.data.get("email")
    password = request.data.get("password")

    try:
        user = UserDetail.objects.get(email=email)
        if not check_password(password, user.password):
            return Response({"error": "Invalid password"}, status=400)

        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
            }
        })

    except UserDetail.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    
@api_view(["POST"])
def resend_otp(request):
    email = request.data.get("email")
    if not email:
        return Response({"error": "Email is required"}, status=400)

    try:
        temp_user = Temp.objects.get(email=email)

        otp = generate_otp()
        temp_user.otp = otp
        temp_user.save()

        send_mail(
            subject="Your LearnBuddy OTP Code (Resent)",
            message=f"Your new OTP is: {otp}",
            from_email=None,  
            recipient_list=[email],
        )

        return Response({"message": "OTP resent successfully"}, status=200)

    except Temp.DoesNotExist:
        return Response({"error": "No signup attempt found for this email"}, status=404)

@api_view(['GET'])
def get_user_score(request):
    """
    Fetch overall score of a user by email (from query param)
    """
    email = request.GET.get('email')
    if not email:
        return Response({'error': 'Email is required'}, status=400)

    try:
        user = UserDetail.objects.get(email=email)
        return Response({'score': float(user.score)})
    except UserDetail.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)


# -----------------------------QUIZ SECTION-------------------------------

CHAPTER_FIELD_MAP = {
    "algebraicfractions": "score_algebra",
    "arithmetic": "score_arithmetic",
    "probability": "score_probability",
    "growthanddepricitation": "score_growthdepr",
    "quadraticequations": "score_quadratic",
    "sequenceandseries": "score_sqnseries",
}

def update_user_overall_score(user):
    detailed = user.detailed_scores

    scores = [
        detailed.score_algebra,
        detailed.score_arithmetic,
        detailed.score_probability,
        detailed.score_growthdepr,
        detailed.score_quadratic,
        detailed.score_sqnseries,
    ]

    user.score = sum(scores) / len(scores)
    user.save()

@csrf_exempt
def api_get_question(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    data = json.loads(request.body.decode("utf-8"))
    email = data.get("email")
    chapter = data.get("chapter")
    print(email)
    print(chapter)
    if not email or not chapter:
        return JsonResponse({"error": "email and chapter required"}, status=400)

    try:
        user = UserDetail.objects.get(email=email)
        detailed = user.detailed_scores
    except:
        return JsonResponse({"error": "User not found"}, status=404)

    field = CHAPTER_FIELD_MAP.get(chapter.lower())
    if not field:
        return JsonResponse({"error": "Invalid chapter"}, status=400)

    current_score = getattr(detailed, field)
    difficulty = int(current_score) + 1
    difficulty = min(5, max(1, difficulty))

    payload = {
        "chapter": chapter,
        "difficulty": difficulty
    }

    try:
        response = requests.post(
            settings.MODEL_BACKEND + "/api/mcq",
            json=payload,
            timeout=300
        )
        result = response.json()
    except Exception:
        return JsonResponse({"error": "Model backend failed"}, status=500)

    data_block = result.get("data", {})

    options = data_block.get("options", {})
    correct_key = data_block.get("correct_option")

    formatted = {
        "question": data_block.get("question"),

        "options": [
            f"A. {options.get('A', '')}",
            f"B. {options.get('B', '')}",
            f"C. {options.get('C', '')}",
            f"D. {options.get('D', '')}",
        ],

        "correct_answer": f"{correct_key}. {options.get(correct_key, '')}",

        "explanations": [
            f"A: {data_block.get('distractor_rationales', {}).get('A', '')}",
            f"B: {data_block.get('distractor_rationales', {}).get('B', '')}",
            f"C: {data_block.get('answer_explanation', '')}",
            f"D: {data_block.get('distractor_rationales', {}).get('D', '')}",
        ],

        "difficulty_used": difficulty
    }

    return JsonResponse(formatted, status=200)


@csrf_exempt
def api_submit_answer(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    data = json.loads(request.body.decode("utf-8"))
    email = data.get("email")
    chapter = data.get("chapter")
    correct = data.get("correct")
    difficulty = int(data.get("difficulty"))

    print(difficulty)

    try:
        user = UserDetail.objects.get(email=email)
        detailed = user.detailed_scores
    except:
        return JsonResponse({"error": "User not found"}, status=404)

    field = CHAPTER_FIELD_MAP.get(chapter.lower())
    if not field:
        return JsonResponse({"error": "Invalid chapter"}, status=400)

    current_score = getattr(detailed, field)

    if correct:
        new_score = min(5.0, current_score + difficulty)
    else:
        new_score = max(0.0, current_score - difficulty)

    setattr(detailed, field, new_score)
    detailed.save()

    update_user_overall_score(user)

    return JsonResponse({
        "success": True,
        "new_chapter_score": new_score,
        "overall_score": user.score
    })

@csrf_exempt
def api_solve_question(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    try:
        data = json.loads(request.body.decode("utf-8"))
    except:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    chapter = data.get("chapter")
    question = data.get("question")

    if not chapter or not question:
        return JsonResponse(
            {"error": "chapter and question required"},
            status=400
        )

    payload = {
        "chapter": chapter,
        "question": question
    }

    try:
        response = requests.post(
            settings.MODEL_BACKEND + "/api/solve",
            json=payload,
            timeout=300
        )
        result = response.json()
    except Exception as e:
        print("Solve backend error:", e)
        return JsonResponse(
            {"error": "Model backend failed"},
            status=500
        )

    data_block = result.get("data", {})

    given = data_block.get("given")
    to_find = data_block.get("to_find")
    steps_raw = data_block.get("steps")
    final_answer = data_block.get("final_answer")

    solution_steps = []

    if isinstance(steps_raw, list):
        solution_steps = steps_raw

    elif isinstance(steps_raw, str):
        solution_steps = [
            step.strip()
            for step in steps_raw.split(",")
            if step.strip()
        ]

    formatted = {
        "question": question,
        "given": given,
        "to_find": to_find,
        "solution": solution_steps,
        "final_answer": final_answer
    }
    print(formatted)

    return JsonResponse(formatted, status=200)

@csrf_exempt
def api_chat_solve(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    try:
        data = json.loads(request.body.decode("utf-8"))
    except:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    question = data.get("question")

    if not question:
        return JsonResponse(
            {"error": "question required"},
            status=400
        )

    payload = {
        "question": question
    }

    try:
        response = requests.post(
            settings.MODEL_BACKEND + "/api/solve_auto",
            json=payload,
            timeout=300
        )
        result = response.json()
    except Exception as e:
        print("Chat backend error:", e)
        return JsonResponse(
            {"error": "Model backend failed"},
            status=500
        )

    if result.get("error") and not result.get("data"):
        return JsonResponse(
            {
                "question": question,
                "answer": result.get("error"),
                "status": "error"
            },
            status=200
        )

    data_block = result.get("data", {})

    if not data_block:
        return JsonResponse(
            {
                "question": question,
                "answer": "Unable to solve this question. Router could not classify this question into a valid chapter.",
                "status": "error"
            },
            status=200
        )

    given = data_block.get("given")
    to_find = data_block.get("to_find")
    steps_raw = data_block.get("steps")
    final_answer = data_block.get("final_answer")

    solution_steps = []

    if isinstance(steps_raw, list):
        solution_steps = steps_raw
    elif isinstance(steps_raw, str):
        solution_steps = [
            step.strip()
            for step in steps_raw.split(",")
            if step.strip()
        ]

    formatted = {
        "question": question,
        "routed_chapter": result.get("routed_chapter"),
        "adapter": result.get("adapter"),
        "given": given,
        "to_find": to_find,
        "solution": solution_steps,
        "final_answer": final_answer,
        "status": "success"
    }

    print("CHAT RESPONSE:", formatted)

    return JsonResponse(formatted, status=200)
