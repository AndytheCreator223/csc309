python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install django
pip install djangorestframework
pip install drf-spectacular
pip install Pillow
pip install djangorestframework-simplejwt
pip install django-enumfields
cd oneonone
python3 manage.py makemigrations
python3 manage.py migrate