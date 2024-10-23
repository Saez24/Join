from django.db import models

# Create your models here.


class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Names(models.Model):
    name = models.CharField(max_length=100)
    email = models.TextField(max_length=100)
    phone = models.TextField(max_length=100)

    def __str__(self):
        return self.name


class Subtasks(models.Model):
    title = models.CharField(max_length=100, blank=True)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return self.title


class TaskStatus(models.Model):
    name = models.CharField(max_length=100)


class Priority(models.Model):
    name = models.CharField(max_length=100)


class Tasks(models.Model):
    assigned_to = models.ManyToManyField(Names, related_name='tasks')
    category = models.ManyToManyField(Category, related_name='tasks')
    description = models.TextField()
    due_date = models.DateField()
    priority = models.ManyToManyField(Priority, related_name='tasks')
    status = models.ManyToManyField(TaskStatus, related_name='tasks')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    subtask = models.ManyToManyField(Subtasks, related_name='tasks')
    title = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.title} ({self.category}))"
