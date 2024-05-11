
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
const port=8000

const app= express()
//app.use(express.json())
app.use(cors())
app.use(bodyParser.urlencoded({extended:false}))

app.get('/',(req,res)=>{
    res.status(200).send({
        status:"Success",
        message:"Server started!"
    })
})

// -----Routes-----


app.listen(port, () => {
    console.log(`Server started on ${port}`)
})