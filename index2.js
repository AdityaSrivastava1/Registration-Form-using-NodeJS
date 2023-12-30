import express from "express";

import path from "path";
import cookieParser from "cookie-parser";
import  mongoose from "mongoose";

import jwt from "jsonwebtoken";

const app = express();
mongoose.connect("mongodb://localhost:27017",{
    dbName:"backend",
})
.then(()=>console.log("Database connected"))
.catch((e)=>console.log(e));

const userSchema  = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
});

const User= mongoose.model("User",userSchema);

app.get("/add", async (req,res)=>{
await msg.create({name:"Aditya",email:"srivastavaadi129@gmail.com"}).then(()=>{
    res.send("Nice");
}) 
})

//in order to send the static file
app.use(express.static(path.join(path.resolve(),"public")));
console.log(path.join(path.resolve(),"public"));


//use it to fetch the credentials from form
app.use(express.urlencoded({extended:true}));

app.use(cookieParser());


//in order to send file using ejs  basically a particular part of html
app.set("view engine","ejs");



//form wala page site pr show krega
app.get("/",(req,res)=>{ 

 
    //we can send error msg 
    // res.status(400).send("error hai bhai");
 res.render("form");
})

//sucess wala page render krne k liye
app.get("/sucess",(req,res)=>{
    res.render("sucess");
})

// app.get("/login",(req,res)=>{
//     const {token} = req.cookies;
//     if(token){
//         res.render("logout")
//     }
//     else{
//         res.render("login");
//     }
//     console.log(req.cookies);
    
// })

app.get("/register",(req,res)=>{
    res.render("register");
})

const isAuthenticated = async  (req,res,next)=>{
    const {token} = req.cookies;
    if(token){

        //in order to show user data from db 
        const decoded = jwt.verify(token,"abcasjdnaskdjakd");
        req.user =await User.findById(decoded._id);
        next();
    }
    else{
        res.render("login")
    }
}

app.get("/login", isAuthenticated, async (req,res)=>{
     
    let user = await User.findone({email});
    if(!user)
    {

        return res.redirect("/register");

    }

    console.log("user data is " , req.user);

    res.render("logout",{name:req.user.name,email:req.user.email});
})


app.post("/login",async (req,res)=>{

    const { name,email,password }=req.body;
    //db mae save ho gya
    const user = await User.create({
        name,
        email,
        password,
    })

    //fetching user id from db
    const token  = jwt.sign({_id:user._id},"abcasjdnaskdjakd");
    //cookie set of name token and any value like iamin
    console.log(token);

// we use jwt token in order to fetch user id from db otherwise we could be 
// able to write user._id in place of token
    res.cookie("token",token,{
        httpOnly:true,
        expires:new Date(Date.now() + 60*1000)
    });
    res.redirect("/logout");
})




// app.get("/logout",(req,res)=>{

//     //cookie set of name token and any value like iamin
//     res.cookie("token",null,{
//         httpOnly:true,
//         expires:new Date(Date.now())
//     });
//     res.redirect("/logout");
// })

app.get("/logout",(req,res)=>{

    //cookie set of name token and any value like iamin
    res.cookie("token",null,{
        httpOnly:true,
        expires:new Date(Date.now())
    });
    res.redirect("/login");
})



const users = [];

//to fetch credentials and res.redirect to render after click on submit button
app.post("/", async (req,res)=>{ 

//users wale array mae puch kr dengey credentials
// users.push({username:req.body.name,email:req.body.email});

const {name,email,password} = req.body;
const messageData = {name:name,email:email,password:password};

await msg.create(messageData);

    //we can send error msg 
    // res.status(400).send("error hai bhai");
    res.redirect("/sucess");
    console.log(req.body.name);
})

app.get("/users",(req,res)=>{
    res.json({
       users,
    });
})


app.get("/file",(req,res)=>{

    //To View any file
    //kis folder k andar kam chal rha
    //method 1 👇
    // const pathlocation = path.resolve();
    
    // console.log(path.join(pathlocation,"./index.html")) ;

    // res.sendFile(path.join(pathlocation,"./index.html"));

    //method 2 👇 using ejs
//first write app.set("view engine","ejs");
 res.render("form");

})

//sending static file
app.get("/staticfile",(req,res)=>{
    res.sendFile("abc");
})

app.get("/getjson",(req,res)=>{
    res.json({
        success:true,
        products:[],
    });
})




app.listen(5000,()=>{
    console.log("server is working")
})