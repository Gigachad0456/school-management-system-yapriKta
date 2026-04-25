import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import (
    TeacherProfile, Class, Section, StudentProfile,
    Subject, Attendance, FeeCategory, FeePayment,
    Exam, Mark, Notice
)

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed the database with initial data for testing.'

    def handle(self, *args, **kwargs):
        self.stdout.write("Clearing existing data...")
        User.objects.all().delete()
        Class.objects.all().delete()
        Subject.objects.all().delete()
        FeeCategory.objects.all().delete()

        self.stdout.write("Creating Admin...")
        admin = User.objects.create_superuser('admin', 'admin@yapri.edu', 'admin123', role=User.Role.ADMIN, first_name='System', last_name='Admin')

        self.stdout.write("Creating Classes & Sections...")
        classes = []
        for i in range(1, 6):
            c = Class.objects.create(name=f"Grade {i}")
            classes.append(c)
        
        self.stdout.write("Creating Subjects...")
        subjects_data = [('Mathematics', 'MATH101'), ('Science', 'SCI101'), ('English', 'ENG101'), ('History', 'HIS101')]
        subjects = [Subject.objects.create(name=n, code=c) for n, c in subjects_data]

        self.stdout.write("Creating Teachers...")
        teachers = []
        for i in range(1, 4):
            u = User.objects.create_user(f"teacher{i}", f"teacher{i}@yapri.edu", "password123", role=User.Role.TEACHER, first_name=f"Teacher{i}", last_name="Smith")
            tp = TeacherProfile.objects.create(user=u, phone=f"555-010{i}", subject=random.choice(subjects).name, qualification="B.Ed", joining_date=date.today() - timedelta(days=365))
            teachers.append(tp)

        self.stdout.write("Assigning Sections...")
        sections = []
        for c in classes:
            s1 = Section.objects.create(name="A", grade_class=c, class_teacher=random.choice(teachers))
            s2 = Section.objects.create(name="B", grade_class=c, class_teacher=random.choice(teachers))
            sections.extend([s1, s2])

        self.stdout.write("Creating Students...")
        students = []
        for i in range(1, 16):
            u = User.objects.create_user(f"student{i}", f"student{i}@yapri.edu", "password123", role=User.Role.STUDENT, first_name=f"Student{i}", last_name="Doe")
            sp = StudentProfile.objects.create(
                user=u,
                admission_number=f"YAP{1000+i}",
                grade_class=random.choice(classes),
                section=random.choice(sections),
                date_of_birth=date.today() - timedelta(days=3650 + random.randint(0, 1000)),
                gender=random.choice([StudentProfile.Gender.MALE, StudentProfile.Gender.FEMALE]),
                parent_name=f"Parent of {i}",
                phone_number=f"555-020{i}",
                admission_date=date.today() - timedelta(days=100)
            )
            students.append(sp)

        self.stdout.write("Creating Notices...")
        Notice.objects.create(title="Welcome to New Academic Year", description="We welcome all students and teachers to the new academic year.", audience=Notice.Audience.ALL)
        Notice.objects.create(title="Staff Meeting", description="Monthly staff meeting will be held on Friday.", audience=Notice.Audience.TEACHERS)
        Notice.objects.create(title="Holiday Announcement", description="School will remain closed on Monday due to public holiday.", audience=Notice.Audience.STUDENTS)

        self.stdout.write("Creating Fee Categories & Payments...")
        tuition = FeeCategory.objects.create(name="Tuition Fee", amount=500.00)
        library = FeeCategory.objects.create(name="Library Fee", amount=50.00)
        
        for sp in students[:5]:
            FeePayment.objects.create(student=sp, fee_category=tuition, paid_amount=500.00, status=FeePayment.Status.PAID, payment_date=date.today())
        for sp in students[5:10]:
            FeePayment.objects.create(student=sp, fee_category=tuition, paid_amount=200.00, status=FeePayment.Status.PARTIAL, payment_date=date.today())
        for sp in students[10:]:
            FeePayment.objects.create(student=sp, fee_category=tuition, paid_amount=0.00, status=FeePayment.Status.UNPAID)

        self.stdout.write(self.style.SUCCESS("Database seeded successfully!"))
        self.stdout.write("Test Accounts:")
        self.stdout.write("Admin: admin / admin123")
        self.stdout.write("Teacher: teacher1 / password123")
        self.stdout.write("Student: student1 / password123")
