from django.urls import path
from . import views

app_name = 'reports'

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('test-connection/', views.test_connection, name='test_connection'),
    path('execute-query/', views.execute_query, name='execute_query'),
    path('download-excel/', views.download_excel, name='download_excel'),
]