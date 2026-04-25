from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        TEACHER = 'TEACHER', 'Teacher'
        STUDENT = 'STUDENT', 'Student / Parent'
    
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STUDENT)
    
    def __str__(self):
        return f"{self.username} ({self.role})"

class TeacherProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile')
    phone = models.CharField(max_length=20, blank=True)
    subject = models.CharField(max_length=100, blank=True)
    qualification = models.CharField(max_length=100, blank=True)
    joining_date = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True)
    status = models.BooleanField(default=True) # Active or inactive

    def __str__(self):
        return self.user.get_full_name() or self.user.username

class Class(models.Model):
    name = models.CharField(max_length=50) # e.g., Grade 1, Grade 2
    
    def __str__(self):
        return self.name

class Section(models.Model):
    name = models.CharField(max_length=50) # e.g., A, B, C
    grade_class = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='sections')
    class_teacher = models.ForeignKey(TeacherProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_sections')
    
    def __str__(self):
        return f"{self.grade_class.name} - {self.name}"

class StudentProfile(models.Model):
    class Gender(models.TextChoices):
        MALE = 'MALE', 'Male'
        FEMALE = 'FEMALE', 'Female'
        OTHER = 'OTHER', 'Other'

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    admission_number = models.CharField(max_length=50, unique=True)
    grade_class = models.ForeignKey(Class, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    section = models.ForeignKey(Section, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=Gender.choices, blank=True)
    parent_name = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    admission_date = models.DateField(null=True, blank=True)
    status = models.BooleanField(default=True) # Active or inactive

    def __str__(self):
        return self.user.get_full_name() or self.user.username

class Subject(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    
    def __str__(self):
        return f"{self.name} ({self.code})"

class Attendance(models.Model):
    class Status(models.TextChoices):
        PRESENT = 'PRESENT', 'Present'
        ABSENT = 'ABSENT', 'Absent'
        LATE = 'LATE', 'Late'

    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PRESENT)

    class Meta:
        unique_together = ('student', 'date')

    def __str__(self):
        return f"{self.student.user.username} - {self.date} - {self.status}"

class FeeCategory(models.Model):
    name = models.CharField(max_length=100) # e.g., Tuition Fee, Library Fee
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.name} - ${self.amount}"

class FeePayment(models.Model):
    class Status(models.TextChoices):
        PAID = 'PAID', 'Paid'
        PARTIAL = 'PARTIAL', 'Partial'
        UNPAID = 'UNPAID', 'Unpaid'

    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='fee_payments')
    fee_category = models.ForeignKey(FeeCategory, on_delete=models.CASCADE, related_name='payments')
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.UNPAID)
    payment_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.student.user.username} - {self.fee_category.name} - {self.status}"

class Exam(models.Model):
    name = models.CharField(max_length=100) # e.g., Midterm, Final
    date = models.DateField()
    grade_class = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='exams')

    def __str__(self):
        return f"{self.name} - {self.grade_class.name}"

class Mark(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='marks')
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='marks')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='marks')
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2)
    max_marks = models.DecimalField(max_digits=5, decimal_places=2, default=100.00)

    class Meta:
        unique_together = ('exam', 'student', 'subject')

    def __str__(self):
        return f"{self.student.user.username} - {self.exam.name} - {self.subject.name}"

class Notice(models.Model):
    class Audience(models.TextChoices):
        ALL = 'ALL', 'All'
        TEACHERS = 'TEACHERS', 'Teachers'
        STUDENTS = 'STUDENTS', 'Students/Parents'

    title = models.CharField(max_length=200)
    description = models.TextField()
    date = models.DateField(auto_now_add=True)
    audience = models.CharField(max_length=15, choices=Audience.choices, default=Audience.ALL)

    def __str__(self):
        return self.title
