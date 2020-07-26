JWT_REG=$(curl -X POST http://localhost:6000/login -H "content-type: application/x-www-form-urlencoded" -d 'username=regulator&password=password' 2>/dev/null | jq .token)
JWT_REG=${JWT_REG:1:${#JWT_REG}-2}
export JWT_REG
