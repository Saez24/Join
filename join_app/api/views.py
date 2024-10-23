from rest_framework.decorators import api_view
from .serializers import CategorySerializer, NamesSerializer, SubtasksSerializer, TaskstatusSerializer, PrioritySerializer, TasksSerializer
from join_app.models import Category, Names, Subtasks, TaskStatus, Priority, Tasks
from rest_framework.response import Response
from rest_framework import viewsets


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class NamesViewSet(viewsets.ModelViewSet):
    queryset = Names.objects.all()
    serializer_class = NamesSerializer


class SubtasksViewSet(viewsets.ModelViewSet):
    queryset = Subtasks.objects.all()
    serializer_class = SubtasksSerializer


class TaskstatusViewSet(viewsets.ModelViewSet):
    queryset = TaskStatus.objects.all()
    serializer_class = TaskstatusSerializer


class PriorityViewSet(viewsets.ModelViewSet):
    queryset = Priority.objects.all()
    serializer_class = PrioritySerializer


class TasksViewSet(viewsets.ModelViewSet):
    queryset = Tasks.objects.all()
    serializer_class = TasksSerializer
