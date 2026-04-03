from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .ml_service import process_image_pipeline

@api_view(['POST'])
def predict_disease(request):
    image_file = request.FILES.get('image')
    
    # 🔥 THE FIX: Grab the language sent from React's FormData
    # If for some reason it's missing, it safely defaults to "English"
    target_language = request.data.get('language', 'English')

    if not image_file:
        return Response(
            {"message": "No image provided."}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    print(f"✅ Received image: {image_file.name}. Language requested: {target_language}. Starting AI Pipeline...")

    # 🔥 Pass the language down to the ML service!
    result = process_image_pipeline(image_file, language=target_language)

    if "error" in result:
        return Response(
            {"message": result["error"]}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    # Return the fully generated JSON back to React!
    return Response(result, status=status.HTTP_200_OK)