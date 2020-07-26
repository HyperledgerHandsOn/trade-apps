JWT_IMPBANK=$(curl -X POST http://localhost:5000/login -H "content-type: application/x-www-form-urlencoded" -d 'username=ib&password=password' 2>/dev/null | jq .token)
JWT_IMPBANK=${JWT_IMPBANK:1:${#JWT_IMPBANK}-2}
export JWT_IMPBANK
