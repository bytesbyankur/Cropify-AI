from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .ml_service import process_image_pipeline

@api_view(['POST'])
def predict_disease(request):
    image_file = request.FILES.get('image')

    if not image_file:
        return Response(
            {"message": "No image provided."}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    print(f"✅ Received image: {image_file.name}. Starting AI Pipeline...")

    # Run the image through the CNN + LLM pipeline
    result = process_image_pipeline(image_file)

    if "error" in result:
        return Response(
            {"message": result["error"]}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    # Return the fully generated JSON back to React!
    return Response(result, status=status.HTTP_200_OK)