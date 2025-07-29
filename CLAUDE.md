# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ForgeReports is a Django-based web application for secure, dynamic visualization of SQL-based reports. This is an internal project by CodeForge Systems that allows technical users to create reports with SQL queries and end users to view filtered results through a hierarchical folder system.

## Current State

This repository is in early development phase. No Django project has been created yet. The repository contains:
- `README_PORTAL_RELATORIOS.md` - Comprehensive project documentation in Portuguese  
- `.env.example` - Environment variables template
- Standard Python `.gitignore` 

## Technology Stack

- **Backend**: Django 4.x, Python 3.x
- **Database**: SQLite (development) → PostgreSQL (production future)
- **External Connections**: SQL Server via pyodbc (MVP only)
- **Frontend**: HTML5, Bootstrap 4.5, Tailwind CSS
- **Dependencies**: pyodbc, django-bootstrap4, openpyxl

## Architecture Overview

The project follows a Django multi-app architecture with role-based access control:

### Django Apps Structure
```
portal_relatorios/
├── core/                # Main app (dashboard, shared views)
├── users/               # Authentication and user management  
├── reports/             # Report CRUD, execution, filtering
├── connections/         # Database connection management
├── templates/           # HTML templates (base.html, sidebar.html)
├── static/              # CSS, JS, images
├── settings.py          # Django configuration
└── manage.py           # Django management
```

### Key Models Architecture
- **User Groups**: `Tecnicos` (full access) and `Usuarios` (read-only)
- **DatabaseConnection**: External database credentials and connection details
- **ReportFolder**: Hierarchical folder system for report organization
- **Report**: SQL queries with associated filters and permissions
- **ReportFilter**: Dynamic filters (text, select, date) for each report

### User Experience Flow
1. **Single Login**: All users authenticate through one login system
2. **Role-Based Views**: Interface adapts based on user group membership
3. **Folder Navigation**: Hierarchical browsing with search functionality  
4. **Dynamic Filtering**: Apply filters before SQL execution
5. **Excel Export**: Built-in export functionality for all reports

## Development Commands

### Initial Django Setup
```bash
# Create Django project
django-admin startproject portal_relatorios .

# Create Django apps  
python manage.py startapp core
python manage.py startapp users
python manage.py startapp reports  
python manage.py startapp connections

# Install dependencies
pip install django pyodbc django-bootstrap4 openpyxl

# Database setup
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

### Development Workflow
```bash
# Run development server
python manage.py runserver

# Create migrations after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Django shell for testing
python manage.py shell

# Collect static files (production)
python manage.py collectstatic
```

## MVP Implementation Phases

### Phase 1: Base Structure (1-2 weeks)
- Django project with apps: core, users, reports, connections
- Basic models: User groups, DatabaseConnection, Report, ReportFilter
- Template structure with Bootstrap/Tailwind integration

### Phase 2: Authentication (1 week)  
- Single login with group-based permissions
- Middleware for role-based view access
- Dashboard templates for Tecnicos vs Usuarios

### Phase 3: Database Connections (1 week)
- CRUD for SQL Server connections (MVP only)
- Connection testing functionality
- Service layer for database operations

### Phase 4: Report Management (2 weeks)
- Hierarchical folder system (ReportFolder model)
- Report CRUD with SQL editor
- Dynamic filter system (text, select, date)
- User permission assignment

### Phase 5: Visualization & Execution (2 weeks)
- Folder navigation interface with breadcrumbs
- Search functionality across reports
- Dynamic filter application to SQL queries
- Paginated results display
- Excel export with openpyxl

### Phase 6: Refinements (1 week)
- Error handling and logging
- Performance optimizations
- UI/UX polish

## Database Connection Architecture

The application uses a service-based approach for external database connections:

```python
# connections/services.py - MVP implementation
def get_database_connection(database_connection):
    if database_connection.tipo_banco == 'sqlserver':
        connection_string = (
            f"DRIVER={{ODBC Driver 17 for SQL Server}};"
            f"SERVER={database_connection.servidor};"
            f"DATABASE={database_connection.banco};"
            f"UID={database_connection.usuario};"
            f"PWD={database_connection.senha}"
        )
        return pyodbc.connect(connection_string)
    else:
        raise NotImplementedError(f"{database_connection.tipo_banco} support coming in future versions")
```

## Security Architecture

### MVP Security Approach
- **Password Storage**: Plain text (internal users only, MVP constraint)
- **SQL Validation**: None in MVP (trusted technical users)
- **Input Sanitization**: Basic Django form validation
- **Access Control**: Django groups and permissions

### Post-MVP Security Enhancements
- Password encryption for database credentials
- SQL query parsing and validation (SELECT only)
- Advanced input sanitization
- Rate limiting and query logging

## User Interface Patterns

### Technical Users (Tecnicos)
- Full administrative interface
- "Switch to User View" toggle functionality
- Complete CRUD operations on all entities
- SQL editor with syntax highlighting (future)

### End Users (Usuarios)  
- Simplified navigation focused on report consumption
- Folder-based browsing with search
- Filter application interface
- Export functionality only

## Testing Strategy

```bash
# Run tests (when implemented)
python manage.py test

# Run specific app tests
python manage.py test reports

# Coverage reporting (when configured)
coverage run --source='.' manage.py test
coverage report
```

## Environment Configuration

Based on `.env.example`:
```bash
SECRET_KEY=your-secret-key-here
DEBUG=True
# Additional variables will be added as needed
```