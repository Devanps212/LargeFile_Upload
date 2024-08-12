import Pkg from 'pg'
const { Pool } = Pkg

export const pool =new Pool({
    user:'postgres',
    host:'localhost',
    database:'students',
    password:process.env.PASS,
    port:5432
})

const connectDB = async()=>{
    try{
        console.log(typeof process.env.PASS)
        await pool.connect()
        console.log("connected to DB")        
    }catch(error){
        console.log(error)
    }
}

export default connectDB