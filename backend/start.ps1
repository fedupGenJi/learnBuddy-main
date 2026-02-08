$ip = python get_ip.py
Write-Host "Backend running on $ip"

# Clear Temp table
python manage.py clear_temp

# Start Django server
python manage.py runserver 0.0.0.0:1233
