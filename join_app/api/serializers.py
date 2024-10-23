from rest_framework import serializers
from join_app.models import Category, Names, Subtasks, TaskStatus, Priority, Tasks


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class CategoryHyperlinkedSerializer(CategorySerializer, serializers.HyperlinkedModelSerializer):

    class Meta:
        model = Category
        fields = '__all__'


class NamesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Names
        fields = '__all__'


class NamesHyperlinkedSerializer(NamesSerializer, serializers.HyperlinkedModelSerializer):

    class Meta:
        model = Category
        fields = '__all__'


class SubtasksSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtasks
        fields = '__all__'


class TaskstatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskStatus
        fields = '__all__'


class PrioritySerializer(serializers.ModelSerializer):
    class Meta:
        model = Priority
        fields = '__all__'


class TasksSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tasks
        fields = '__all__'
