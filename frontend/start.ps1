$ip = python get_ip.py
Write-Host "Frontend running on $ip"

# react app start
$env:HOST="0.0.0.0"
$env:PORT="3000"
npm start