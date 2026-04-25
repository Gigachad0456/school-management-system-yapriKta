from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, TeacherProfile, Class, Section, StudentProfile,
    Subject, Attendance, FeeCategory, FeePayment,
    Exam, Mark, Notice
)

admin.site.register(User, UserAdmin)
admin.site.register(TeacherProfile)
admin.site.register(Class)
admin.site.register(Section)
admin.site.register(StudentProfile)
admin.site.register(Subject)
admin.site.register(Attendance)
admin.site.register(FeeCategory)
admin.site.register(FeePayment)
admin.site.register(Exam)
admin.site.register(Mark)
admin.site.register(Notice)
