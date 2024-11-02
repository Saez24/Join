from django.db import models

# Create your models here.


class Category(models.Model):
    name = models.CharField(max_length=100)

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


class Subtasks(models.Model):
    title = models.CharField(max_length=100, blank=True)
    completed = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Subtask"         
        verbose_name_plural = "Subtasks"  

    def __str__(self):
        return self.title


class TaskStatus(models.Model):
    name = models.CharField(max_length=100)

    class Meta:
        verbose_name = "Taskstatus"       
        verbose_name_plural = "Taskstatus" 

    def __str__(self):
        return self.name


class Priority(models.Model):
    name = models.CharField(max_length=100)

    class Meta:
        verbose_name = "Priority"         # Einzelbezeichnung
        verbose_name_plural = "Priorities"  # Mehrzahl festlegen

    def __str__(self):
        return self.name


STATUS_CHOICES = [
    ('todo', 'To Do'),
    ('in_progress', 'In Progress'),
    ('done', 'Done'),
    # Weitere Statuswerte hier hinzufügen
]

PRIORITY_CHOICES = [
    ('low', 'Low'),
    ('medium', 'Medium'),
    ('urgent', 'Urgent'),
    # Weitere Prioritätswerte hier hinzufügen
]

CATEGORY_CHOICES = [
    ('it', 'IT'),
    ('finance', 'Finance'),
    ('sales', 'Sales'),
    ('hr', 'HR'),
    ('marketing', 'Marketing'),
    ('operations', 'Operations')
]


class Tasks(models.Model):
    assigned_to = models.ManyToManyField(Names, related_name='tasks')
    category = models.CharField(
        max_length=20, choices=CATEGORY_CHOICES, default='')
    description = models.TextField()
    due_date = models.DateField()
    priority = models.CharField(
        max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='todo')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    subtask = models.ManyToManyField(Subtasks, related_name='tasks')
    title = models.CharField(max_length=100)

    class Meta:
        verbose_name = "Task"         # Einzelbezeichnung
        verbose_name_plural = "Tasks"  # Mehrzahl festlegen

    def __str__(self):
        return f"{self.title} ({self.category})"
