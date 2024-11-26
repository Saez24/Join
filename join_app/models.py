from django.db import models
from django.db.models import JSONField

# Create your models here.


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Names(models.Model):
    name = models.CharField(max_length=100)
    email = models.TextField(max_length=100)
    phone = models.TextField(max_length=100)

    class Meta:
        verbose_name = "Name"
        verbose_name_plural = "Names"

    def __str__(self):
        return self.name


class TaskStatus(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name = "Taskstatus"
        verbose_name_plural = "Taskstatus"

    def __str__(self):
        return self.name


class Priority(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name = "Priority"         # Einzelbezeichnung
        verbose_name_plural = "Priorities"  # Mehrzahl festlegen

    def __str__(self):
        return self.name


class Tasks(models.Model):
    assignto = models.ManyToManyField('Names', related_name='tasks')
    category = models.CharField(max_length=100, blank=True)
    description = models.TextField()
    duedate = models.DateField()
    prio = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    title = models.CharField(max_length=100)
    # Array von Subtasks als JSONField
    subtask = JSONField(blank=True, default=list)

    class Meta:
        verbose_name = "Task"
        verbose_name_plural = "Tasks"

    def __str__(self):
        return f"{self.title} ({self.category})"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Dynamische Auswahloptionen aus der Datenbank für die Felder laden
        self._meta.get_field('category').choices = [
            (cat.name, cat.name) for cat in Category.objects.all()]
        self._meta.get_field('prio').choices = [
            (pri.name, pri.name) for pri in Priority.objects.all()]
        self._meta.get_field('status').choices = [
            (stat.name, stat.name) for stat in TaskStatus.objects.all()]
