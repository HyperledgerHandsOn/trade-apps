JWT_CAR=$(curl -X POST http://localhost:7000/login -H "content-type: application/x-www-form-urlencoded" -d 'username=carrier&password=password' 2>/dev/null | jq .token)
JWT_CAR=${JWT_CAR:1:${#JWT_CAR}-2}
export JWT_CAR
