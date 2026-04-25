from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, TeacherProfileViewSet, ClassViewSet,
    SectionViewSet, StudentProfileViewSet, SubjectViewSet,
    AttendanceViewSet, FeeCategoryViewSet, FeePaymentViewSet,
    ExamViewSet, MarkViewSet, NoticeViewSet, DashboardViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'teachers', TeacherProfileViewSet)
router.register(r'classes', ClassViewSet)
router.register(r'sections', SectionViewSet)
router.register(r'students', StudentProfileViewSet)
router.register(r'subjects', SubjectViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'fee-categories', FeeCategoryViewSet)
router.register(r'fee-payments', FeePaymentViewSet)
router.register(r'exams', ExamViewSet)
router.register(r'marks', MarkViewSet)
router.register(r'notices', NoticeViewSet)

urlpatterns = [
    path('dashboard/', DashboardViewSet.as_view({'get': 'list'}), name='dashboard'),
    path('', include(router.urls)),
]
