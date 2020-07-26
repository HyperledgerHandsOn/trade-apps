JWT_EXPBANK=$(curl -X POST http://localhost:4000/login -H "content-type: application/x-www-form-urlencoded" -d 'username=eb&password=password' 2>/dev/null | jq .token)
JWT_EXPBANK=${JWT_EXPBANK:1:${#JWT_EXPBANK}-2}
export JWT_EXPBANK
