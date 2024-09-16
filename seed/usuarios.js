import bcrypt from 'bcrypt'

const usuarios = [
    {
        nombre: 'Julián',
        email: 'julian@gmail.com',
        confirmado: 1,
        password: bcrypt.hashSync('1234abcd', 10)
    }
]

export default usuarios