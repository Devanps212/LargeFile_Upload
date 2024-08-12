import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import connectDB from './database/dbConnect.js'
import dotenv from 'dotenv'
import route from './routes/routes.js'
dotenv.config()

connectDB()

const app = express()

app.use(cors())
app.use(morgan('dev'))
app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.use('/', route)

app.listen(3000, ()=>{
    console.log("listening on 3000")
})