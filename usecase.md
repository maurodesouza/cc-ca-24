Signup - Criar Conta

POST /signup
Input: name, email, document, password

* o campo name deve ser composto pelo nome e sobrenome
* email deve ter @ e um domínio como .com ou .com.br
* document deve ser formado somente por números, . e -, sendo que o digito verificador deve ser válido
* password deve ter no mínimo 8 caracteres com letras minúsculas, maiúsculas e números
* deve retornar um JSON contendo o accountId

GetAccount - Obter Conta

GET /accounts/:accountId

* deve retornar 404 caso a conta não exista
* deve retornar 200 caso a conta exista, juntamente com um JSON com accountId, name, email e document
