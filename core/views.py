from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from .models import (
    User, TeacherProfile, Class, Section, StudentProfile,
    Subject, Attendance, FeeCategory, FeePayment,
    Exam, Mark, Notice
)
from .serializers import (
    UserSerializer, TeacherProfileSerializer, ClassSerializer,
    SectionSerializer, StudentProfileSerializer, SubjectSerializer,
    AttendanceSerializer, FeeCategorySerializer, FeePaymentSerializer,
    ExamSerializer, MarkSerializer, NoticeSerializer, DashboardStatsSerializer
)

class IsAdminUserOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.role == User.Role.ADMIN

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class TeacherProfileViewSet(viewsets.ModelViewSet):
    queryset = TeacherProfile.objects.all()
    serializer_class = TeacherProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserOrReadOnly]

class ClassViewSet(viewsets.ModelViewSet):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserOrReadOnly]

class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserOrReadOnly]

class StudentProfileViewSet(viewsets.ModelViewSet):
    queryset = StudentProfile.objects.all()
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserOrReadOnly]

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['student', 'date', 'status']

class FeeCategoryViewSet(viewsets.ModelViewSet):
    queryset = FeeCategory.objects.all()
    serializer_class = FeeCategorySerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserOrReadOnly]

class FeePaymentViewSet(viewsets.ModelViewSet):
    queryset = FeePayment.objects.all()
    serializer_class = FeePaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['student', 'status']

class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserOrReadOnly]

class MarkViewSet(viewsets.ModelViewSet):
    queryset = Mark.objects.all()
    serializer_class = MarkSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['student', 'exam', 'subject']

class NoticeViewSet(viewsets.ModelViewSet):
    queryset = Notice.objects.all().order_by('-date')
    serializer_class = NoticeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        if user.role == User.Role.ADMIN:
            return queryset
        elif user.role == User.Role.TEACHER:
            return queryset.filter(audience__in=[Notice.Audience.ALL, Notice.Audience.TEACHERS])
        else:
            return queryset.filter(audience__in=[Notice.Audience.ALL, Notice.Audience.STUDENTS])

class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        total_students = StudentProfile.objects.count()
        total_teachers = TeacherProfile.objects.count()
        total_classes = Class.objects.count()
        
        total_revenue_aggr = FeePayment.objects.filter(status__in=[FeePayment.Status.PAID, FeePayment.Status.PARTIAL]).aggregate(Sum('paid_amount'))
        total_revenue = total_revenue_aggr['paid_amount__sum'] or 0.00
        
        recent_notices = Notice.objects.order_by('-date')[:5]

        data = {
            'total_students': total_students,
            'total_teachers': total_teachers,
            'total_classes': total_classes,
            'total_revenue': total_revenue,
            'recent_notices': recent_notices,
        }

        serializer = DashboardStatsSerializer(data)
        return Response(serializer.data)
