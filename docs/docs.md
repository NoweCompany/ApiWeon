# Documentation - API Weon

This is the API documentation that provides services to our clients, [WEON](https://github.com/NoweCompany/Nowe/tree/main/weon):

# Endpoints

## /collection

<details>
  <summary> <strong>GET</strong> - Return all collections with their fields</summary>
  
  #### Headers
  | Name           | Value         |
  | -------------- | ------------- |
  | authorization | Bearer `token` |
  
  #### Body
  `No Body`

  #### Response

<details>
<summary>Status code <code>200</code></summary>
    
```js
"response": [
  {
    "collectionName": "Teste",
    "fields": [
      {
        "key": "Nome",
        "type": "string",
        "required": false
      },
      {
        "key": "Idade",
        "type": "bool",
        "required": false
      }
    ]
  },
  {...}
]
```
</details>
  
<details>
<summary>Status code <code>500</code> Internal Server Error</summary>
    
```js
{
  errors: "Ocorreu um erro inesperado"
}
```
</details>
</details>

<details>
  <summary> <strong>POST</strong> - Create new collection</summary>
  
  #### Headers
  | Name           | Value         |
  | -------------- | ------------- |
  | authorization | Bearer `token` |
  
  #### Body
```js
{
  "collectionName": "testehistory"
}
```

  #### Response
  
<details>
<summary>Status code <code>200</code></summary>
    
```js
{
  "success": "Predefinição criada com sucesso"
}
```
</details>
  
<details>
<summary>Status code <code>500</code> Internal Server Error</summary>
    
```js
{
  "errors": "Ocorreu um erro inesperado"
}
```
</details>
</details>

<details>
  <summary> <strong>PUT</strong> - Rename a collection</summary>
  
  #### Headers
  | Name           | Value         |
  | -------------- | ------------- |
  | authorization | Bearer `token` |
  
  #### Body
```js
{
  "collectionName": "teste",
  "newName": "testeEdit"
}
```

  #### Response
  
<details>
<summary>Status code <code>200</code></summary>
    
```js
{
  "success": "Tabela renomeada com sucesso"
}
```
</details>
  
<details>
<summary>Status code <code>500</code> Internal Server Error</summary>
    
```js
{
  "errors": "Ocorreu um erro inesperado"
}
```
</details>
</details>
<details>
  <summary> <strong>DELETE</strong> - Delete a collection</summary>
  
  #### Headers
  | Name           | Value         |
  | -------------- | ------------- |
  | authorization | Bearer `token` |
  
  #### Body
```js
{
  "collectionName": "teste"
}
```

  #### Response
  
<details>
<summary>Status code <code>200</code></summary>
    
```js
{
  "success": "Sua predefinição foi excluida com sucesso"
}
```
</details>
  
<details>
<summary>Status code <code>500</code> Internal Server Error</summary>
    
```js
{
  "errors": "Ocorreu um erro inesperado"
}
```
</details>
</details>
