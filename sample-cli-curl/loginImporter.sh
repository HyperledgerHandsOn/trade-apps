JWT_IMP=$(curl -X POST http://localhost:5000/login -H "content-type: application/x-www-form-urlencoded" -d 'username=importer&password=password' 2>/dev/null | jq .token)
JWT_IMP=${JWT_IMP:1:${#JWT_IMP}-2}
export JWT_IMP
