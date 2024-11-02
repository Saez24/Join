from pstats import Stats
from django.contrib import admin

from .models import Category, Names, Priority, Subtasks, TaskStatus, Tasks

class NamesAdmin(admin.ModelAdmin):
    list_display = ('id','name', 'email', 'phone')

# Register your models here.
admin.site.register(Category)
admin.site.register(Names, NamesAdmin)
admin.site.register(Subtasks)
admin.site.register(TaskStatus)
admin.site.register(Priority)
admin.site.register(Tasks)



