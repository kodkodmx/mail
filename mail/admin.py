from django.contrib import admin

# Register your models here.
from .models import Email
from .models import User

admin.site.register(Email)
admin.site.register(User)

