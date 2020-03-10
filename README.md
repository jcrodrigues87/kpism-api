# kpism-api
API para gerencimento de indicadores

## Variaveis de ambiente

File: `.env`

```
NODE_ENV=devolepment
PORT=expressPort
SECRET=secret
MONGO_URL=mongodb+srv://user:pass@mongoserver.com/database?retryWrites=true
EMAIL_HOST=smtp.server
EMAIL_PORT=smtpPort
EMAIL_USER=userAccount
EMAIL_PASS=userPassword
```

## REST Endpoints

### Department

Create Department
```
POST {{url}}/api/departments
    Input: {
        "department": {
		    "name":"new department",
		    "description":"department"
	    }
    }
    Output: 
```

Get Department List
```
GET {{url}}/api/departments
    Input: -
    Output:
```

Get Department by ID
```
GET {{url}}/api/departments/:departmentId
    Input: -
    Output:
```

Update Department by ID
``` 
PUT {{url}}/api/departments/:departmentId
    Input: {
        "department": {
		    "name":"new department name",
            ...
	    }
    }
    Output:
```

Delete Department by ID
```
DEL {{url}}/api/departments/:departmentId
    Input: -
    Output:
```

### Periods

Create Period
```
POST {{url}}/api/periods
    Input: {
        "periods": {
		    "name":"2020",
		    "begin":"2020-01-01",
		    "end":"2020-12-31"
	    }
    }
    Output: 
```

Get Period List
```
GET {{url}}/api/periods
    Input: -
    Output:
```

Get Period by ID
```
GET {{url}}/api/periods/:periodId
    Input: -
    Output:
```

Get Period References by ID ****************
```
GET {{url}}/api/periods/:periodId
    Input: -
    Output:
```

Update Period by ID
```
PUT {{url}}/api/periods/:periodId
    Input: {
        "period": {
		    "name":"new period name",
            ...
	    }
    }
    Output:
```

Delete Period by Id
```
DEL {{url}}/api/periods/:periodId
    Input: -
    Output:
```

### User

Create User
```
POST {{url}}/api/users
    Input: {
        "user": {
		    "name":"user name",
		    "email":"user@company.com",
		    "role":"user/supervisor/admin",
		    "department": {"id": departmentId}
	    }
    }
    Output: 
```

Get User List
```
GET {{url}}/api/users
    Input: -
    Output:
```

Get User by ID
```
GET {{url}}/api/users/:userId
    Input: -
    Output:
```

Update User
```
PUT {{url}}/api/users/:userId
    Input: {
        "user": {
		    "name":"new user name",
            ...
	    }
    }
    Output:
```

Delete User by ID
```
DEL {{url}}/api/users/:userId
    Input: -
    Output:
```

### Auth

Forgot Password
```
POST {{url}}/api/auth/forgot_password
    Input: {
	    "email":"user@company.com"
    }
    Output:
```

Reset Password
```
POST {{url}}/api/auth/reset_password
    Input: {
	    "email":"user@company.com",
	    "token": token,
	    "password":"user"
    }
    Output:
```

Login
```
POST {{url}}/api/auth/login
    Input: {
	    "user": {
		    "email":"user@company.com",
		    "password":"user"
	    }
    }
    Output:
```

Get User *************** checar nome
```
GET {{url}}/api/auth
    Input: -
    Output:
```