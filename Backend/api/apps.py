import os
from django.apps import AppConfig

# Force legacy Keras BEFORE importing tf_keras
os.environ["TF_USE_LEGACY_KERAS"] = "1"
import tf_keras as keras

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
    
    # Global dictionaries to hold models in memory
    expert_models = {}
    class_labels = {}

    # def ready(self):
    #     print("🤖 Booting up AI Models in Django...")
        
    #     # Change this to the exact folder where your .h5 files live
    #     base_dir = r'D:\IEEE ML' 
        
    #     self.expert_models = {
    #         'apple': keras.models.load_model('ml_models/apple model.h5'),
    #         'corn': keras.models.load_model('ml_models/corn model.h5'),
    #         'potato': keras.models.load_model('ml_models/potato model.h5'),
    #         'tomato': keras.models.load_model('ml_models/tomato model.h5'),
    #         'grapes': keras.models.load_model('ml_models/grapes model.h5')
    #     }

    #     self.class_labels = {
    #         'apple': ['Apple healthy', 'Apple Scab', 'Apple rust', 'Apple rot'],
    #         'corn': ['Corn healthy', 'corn leaf blight', 'corn rust', 'corn leaf gray spot'],
    #         'potato': ['potato healthy', 'potato early blight', 'potato late blight'],
    #         'tomato': ['Tomato healthy', 'tomato early blight', 'tomato late blight', 
    #                    'tomato bacterial spot', 'tomato leaf mold', 'tomato septoria leaf spot', 
    #                    'tomato spider mites', 'tomato target spot', 'tomato yellow leaf curl virus', 
    #                    'tomato mosaic virus']
    #     }
    #     print("✅ All Expert Models Loaded Successfully!")