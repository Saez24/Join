from django.urls import path, include
from .views import CategoryViewSet, NamesViewSet, SubtasksViewSet, TaskstatusViewSet, PriorityViewSet, TasksViewSet
from rest_framework import routers


router = routers.SimpleRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'names', NamesViewSet)
router.register(r'subtasks', SubtasksViewSet)
router.register(r'taskstatus', TaskstatusViewSet)
router.register(r'priority', PriorityViewSet)
router.register(r'tasks', TasksViewSet)


urlpatterns = [
    path('', include(router.urls)),
]
