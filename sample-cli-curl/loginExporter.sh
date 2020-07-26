JWT_EXP=$(curl -X POST http://localhost:4000/login -H "content-type: application/x-www-form-urlencoded" -d 'username=exporter&password=password' 2>/dev/null | jq .token)
JWT_EXP=${JWT_EXP:1:${#JWT_EXP}-2}
export JWT_EXP
