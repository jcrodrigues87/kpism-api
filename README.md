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

Object
```
"department": {
    "id": "5e67cb9e96c8a93e5465ba3c",
    "name": "new department",
    "description": "department",
    "inactive": false,
    "createdAt": "2020-03-10T17:17:18.448Z",
    "updatedAt": "2020-03-10T17:17:18.448Z"
}
```

Create Department
```
POST {{url}}/api/departments
    Input: {
        "department": {
		    "name":"new department",
		    "description":"department"
	    }
    }
    Output: "department": { ... }
```

Get Department List
```
GET {{url}}/api/departments
    Input: -
    Output: "departments": [{ ... }]
```

Get Department by ID
```
GET {{url}}/api/departments/:departmentId
    Input: -
    Output: "department": { ... }
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
    Output: "department": { ... }
```

Delete Department by ID
```
DELELE {{url}}/api/departments/:departmentId
    Input: -
    Output: -
```

### Periods

Object
```
"period": {
    "id": "5e679e690ee1bf17fc28ee7d",
    "name": "2020",
    "begin": "2020-01-01",
    "end": "2020-12-31",
    "closed": false,
    "inactive": false,
    "createdAt": "2020-03-10T14:04:25.051Z",
    "updatedAt": "2020-03-10T14:04:25.051Z"
}
```

Create Period
```
POST {{url}}/api/periods
    Input: {
        "period": {
		    "name":"2020",
		    "begin":"2020-01-01",
		    "end":"2020-12-31"
	    }
    }
    Output: "period": { ... }
```

Get Period List
```
GET {{url}}/api/periods
    Input: -
    Output: "periods": [{ ... }] 
```

Get Period by ID
```
GET {{url}}/api/periods/:periodId
    Input: -
    Output: "period": { ... }
```

Get Period References by ID ****************
```
GET {{url}}/api/periods/:periodId
    Input: -
    Output:????????
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
    Output: "period": { ... }
```

Delete Period by Id
```
DELETE {{url}}/api/periods/:periodId
    Input: -
    Output: -
```

### User

Object
```
"user": {
    "id": "5e67cedc96c8a93e5465ba3e",
    "name": "user name",
    "department": {
        "id": "5e67cb9e96c8a93e5465ba3c",
        "name": "department",
        "description": "department",
        "inactive": true,
        "createdAt": "2020-03-10T17:17:18.448Z",
        "updatedAt": "2020-03-10T17:23:46.746Z"
    },
    "email": "user@company.com",
    "role": "user",
    "inactive": false,
    "createdAt": "2020-03-10T17:31:08.273Z",
    "updatedAt": "2020-03-10T17:31:08.273Z"
}
```

Create User
```
POST {{url}}/api/users
    Input: {
        "user": {
		    "name":"user name",
		    "email":"user@company.com",
		    "role":"user / supervisor / admin",
		    "department": {"id": "5e67cb9e96c8a93e5465ba3c"}
	    }
    }
    Output: "user": { ... }
}
```

Get User List
```
GET {{url}}/api/users
    Input: -
    Output: "users": [{ ... }]
```

Get User by ID
```
GET {{url}}/api/users/:userId
    Input: -
    Output: "user": { ... }
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
    Output: "user": { ... }
```

Delete User by ID
```
DELETE {{url}}/api/users/:userId
    Input: -
    Output: -
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

### Profile

### Chart

### Indicator

### Contract

Object
```
"contract": {
    "id": "5e67b9c830ac952ef046b5f2",
    "period": {
        "id": "5e679e690ee1bf17fc28ee7d",
        "name": "2020",
        "begin": "2020-01-01",
        "end": "2020-12-31",
        "closed": false,
        "inactive": false,
        "createdAt": "2020-03-10T14:04:25.051Z",
        "updatedAt": "2020-03-10T17:28:38.064Z"
    },
    "user": {
        "id": "5e6793b4dc0bd736bc986108",
        "name": "admin",
        "email": "admin@company.com",
        "role": "admin"
    },
    "salary": 0,
    "proportionalPeriod": 0,
    "bonus": 0,
    "qualitative": 0,
    "quantitative": 0,
    "resultContract": 0,
    "plr": 0,
    "tax": 0,
    "finalPlr": 0,
    "createdAt": "2020-03-10T16:01:12.374Z",
    "updatedAt": "2020-03-10T17:08:40.271Z"
}
```

Get Contracts by User and Period
```
GET {{url}}/api/contracts/:userId/:periodId
    Input: -
    Output: "contract": { ... }
``` 

Update Contracts by User and Period
```
PUT {{url}}/api/contracts/:userId/:periodId
    Input: { 
        contract: {
            salary:100,
            ...
        }
    }
    Output: "contract": { ... }
```

Delete Contracts by User and Period
```
DELETE {{url}}/api/contracts/:userId/:periodId
    Input: -
    Output: -
```