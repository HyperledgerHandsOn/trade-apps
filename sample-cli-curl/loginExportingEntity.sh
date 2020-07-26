JWT_EXPENT=$(curl -X POST http://localhost:8000/login -H "content-type: application/x-www-form-urlencoded" -d 'username=exportingentity&password=password' 2>/dev/null | jq .token)
JWT_EXPENT=${JWT_EXPENT:1:${#JWT_EXPENT}-2}
export JWT_EXPENT
