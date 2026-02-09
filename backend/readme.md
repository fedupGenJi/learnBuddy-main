# LearnBuddy-mainBackend
This is the main backend of the learnBuddy Project that handles the authentications and so for the webapplication. 

---
1. Open a virtual environment and install the dependencies:
```bash
pip install -r requirements.txt
```

2. Create an .env file such that it has
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=

EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST_USER=
EMAIL_HOST=
EMAIL_PORT=
EMAIL_HOST_PASSWORD=
EMAIL_USE_TLS=

MODEL_BACKEND= 

3. Run the migrations once when opening the backend for the first time
python manage.py makemigrations core
python manage.py migrate

4. Then run the ./start.ps1 command to run the whole backend.
---

This backend uses the model backend situated at [Backend Model](https://github.com/fedupGenJi/learnBuddy-backendModels.git)