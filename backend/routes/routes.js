import express from 'express'
import { dataUpload, showData } from '../controller/mediaController.js'
import {upload} from '../helper/multer.js'

const route = express.Router()

route.get('/retrive', showData)
route.post('/sendData', upload.single('file'), dataUpload);

export default route