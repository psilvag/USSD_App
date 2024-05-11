
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { https } from "firebase-functions";

import { initializeApp } from "firebase/app";
import { addDoc, collection, getDoc, getDocs, getFirestore, limit, orderBy, query, Timestamp } from "firebase/firestore/lite";


// ---------Firebase config-----------
const firebaseConfig = {
    apiKey: "AIzaSyAM_WahQqYugNjezifbNx_n1mgAJ7Bq4-g",
    authDomain: "ussduser-62b54.firebaseapp.com",
    projectId: "ussduser-62b54",
    storageBucket: "ussduser-62b54.appspot.com",
    messagingSenderId: "303646111656",
    appId: "1:303646111656:web:ed1534e972169290790f9d"
}
const fireBaseApp=initializeApp(firebaseConfig)
const db=getFirestore(fireBaseApp)

// -----------Express Server--------------
const app=express()
app.use(bodyParser.json())
app.use(cors())
app.use(bodyParser.urlencoded({extended:false}))

//----------- APIuusd System-----------------
const initSystemUssd=()=>{
    app.post('/ussd',async (req,res)=>{
        let response=""
        const {
            sessionId,
            serviceCode,
            phoneNumber,
            text,
        }=req.body
    
        if(text==''){
            response=`CON ***Info Operadora***
            1. Ver Saldo
            2. Comprar megas
            3. Ver puntos acumulados
            4. Canjear puntos
            `
        }
        else if(text=='1'){
            const data= await readInfo()
            const infoUserBalance=data.balance
            const infoUserMB=data.MB
            response=`END Saldo: ${JSON.stringify(infoUserBalance)}Bs; MB:${JSON.stringify(infoUserMB)} MB.`
          
          
            
        }
        else if(text=='2'){
            response=`CON **Megas**
            1. 300 MB x 2Bs acumula 25 pts
            2. 500 MB x 3Bs acumula 50 pts
            3. 800 MB x 5Bs acumula 80 pts
            4. 1.3 GB x 8Bs acumula 120pts
            0. Volver`
            
        }
        else if(text=='2*1'){
            const data= await buyMegas(300)
            response=`END ${JSON.stringify(data)}`
        }
        else if(text=='2*2'){
            const data= await buyMegas(500)
            response=`END ${JSON.stringify(data)}`
        }
        else if(text=='2*3'){
            const data= await buyMegas(800)
            response=`END ${JSON.stringify(data)}`
        }
        else if(text=='2*4'){
            const data= await buyMegas(1300)
            response=`END ${JSON.stringify(data)}`
        }
        else if(text=='2*0'){
            response=`END SALIR EN ESPERA...`
        }
        else if(text=='3'){
            const data= await readInfo()
            const infoUserPoints=data.points
            response=`END Puntos:${JSON.stringify(infoUserPoints)} puntos acumulados`
        }
        else if(text=='4'){
            response=`CON EN ESPERA`
        }











        res.set('Content-Type: text/plain')
        res.send(response)
    })

}
initSystemUssd()

app.get('/',(req,res)=>{
    res.status(200).send({
        status:"Success",
        message:"Server UssdApp started!"
    })
})


// ---------Functions for Ussd----------------
 const readInfo= async ()=>{
    try{
        const collectionRef=collection(db,'ussdUser')
        const documentsQuery=await getDocs(query(collectionRef,orderBy("timestamp","desc"),limit(1)))
        if(!documentsQuery.empty){
            const document=documentsQuery.docs[0]
            const prop=document.data()
        
          return {
                balance:prop.balance,
                MB:prop.MB,
                points:prop.points,
                minutes:prop.minutes
          }
        }else {
            throw new Error('No se encontraron documentos en la colección.');
        }
      
    }
    catch(error){
        console.error('Error:',error);
        throw error
    }

 }


 const buyMegas=async(amountMB)=>{
    const userInfo=await readInfo()
    let currentPoints,currentMB,currentBalance

    const megasBalance={ // balance,points
        300:[2,25],
        500:[3,50],
        800:[5,80],
        1300:[8,120]
    }
    if(userInfo.balance>0){
        for(let megas of Object.keys(megasBalance)){
           if(amountMB.toString()===megas){
            if(userInfo.balance>=megasBalance[megas][0]){
                currentMB=userInfo.MB+parseInt(megas)
                currentPoints=userInfo.points+megasBalance[megas][1]
                currentBalance=userInfo.balance-megasBalance[megas][0]
            }
            else{
                return 'Saldo insuficiente'
            }
           }
        }
    }
    else{
        return 'Sin Saldo'
    }
   
    const currentDataUser={
        name:"Pablo",
        lastName:"Silva",
        email:"pmarcelosilvag@gmail.com",
        balance:currentBalance,
        points:currentPoints,
        MB:currentMB,
        minutes:1,
        timestamp:Timestamp.now()
    }
    try{
        const collectionRef=collection(db,'ussdUser')
        await addDoc(collectionRef,currentDataUser)
        // if(docRef.id){
        //     const docSnap = await getDoc(docRef)
        //     const prop = docSnap.data();
        //${prop.MB} Megas, sumaste ${prop.points} puntos
        return `Compra realizada correctamente`
        
    }
    catch(error){
        console.error('Error:',error);
        throw error
    }

    
 }





//const port=7003
// app.listen(port, () => {
// console.log(`Server started on ${port}`)
// })

//exports.app=functions.https.onRequest(app) //CommonJS
export const ussdApp=https.onRequest(app)