![Nowe Company Bannwe](https://github.com/NoweCompany/Nowe/blob/main/assets/img/slogan.jpg)
# ApiWeon

This api was developed with the intention of providing services to our Front-End CLIENT, see below the instructions for initialization

# Initialization

1. Create a ".env" file in the root of the project and add the ".env_example" variables in it according to your environment
``` env
    #Aplication
    URL=http://localhost:3300
    SERVER_PORT=3300
    
    #DataBases
    DATABASE=database_name
    DATABASE_HOST=localhost
    DATABASE_PORT=3306
    DATABASE_USERNAME=root
    DATABASE_PASSWORD=password
    
    MONGO_CONNECTION_STRING=Url_of_conection_mongodb
    
    #Token
    TOKEN_EXPIRATION=7d
    TOKEN_SECRET=scret_token
    
    #Configuring the containers Docker
    MYSQL_DATABASE=database_name
    MYSQL_ROOT_PASSWORD=password
    API_PORT=3300
    DB_MYSQL_PORT=3306
```

2. Intall dependences
```
    npm install
```

3. run migrations of the Sequelize
```
    npx sequelize db:migrate
```

4. run the build and start project
```
    npm run build
```
```
    npm run start
```

# Command to raise containers
> Remembering that to upload the containers you must first install the dependencies and create the `.env`
```
  docker-compose up -d
```

# Authors

- [Moyseys Veroni](https://www.github.com/moyseys)

