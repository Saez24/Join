from pstats import Stats
from django import forms
from django.contrib import admin

from .models import Category, Names, Priority, TaskStatus, Tasks


class NamesAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email', 'phone')


class TasksAdminForm(forms.ModelForm):
    class Meta:
        model = Tasks
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Setzen der Auswahloptionen für Kategorie, Priorität und Status
        self.fields['category'].choices = [
            (cat.name, cat.name) for cat in Category.objects.all()]
        self.fields['prio'].choices = [
            (pri.name, pri.name) for pri in Priority.objects.all()]
        self.fields['status'].choices = [
            (stat.name, stat.name) for stat in TaskStatus.objects.all()]


class TasksAdmin(admin.ModelAdmin):
    form = TasksAdminForm


# Register your models here.
admin.site.register(Category)
admin.site.register(Names, NamesAdmin)
admin.site.register(TaskStatus)
admin.site.register(Priority)
admin.site.register(Tasks, TasksAdmin)
