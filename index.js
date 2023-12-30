import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import  mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt, { hash } from "bcrypt";


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

//in order to send the static file
app.use(express.static(path.join(path.resolve(),"public")));
console.log(path.join(path.resolve(),"public"));

//use it to fetch the credentials from form
app.use(express.urlencoded({extended:true}));

app.use(cookieParser());


//in order to send file using ejs  basically a particular part of html
app.set("view engine","ejs");




const isAuthenticated = async  (req,res,next)=>{

    console.log("isauthenticated triggered 2");
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

app.get("/", isAuthenticated, async (req,res)=>{

    console.log("app.get request trigerred");
    
    res.render("logout",{ name:req.user.name,email:req.user.email });
})

app.get("/login",(req,res)=>{
    res.render("login");
})

app.get("/register",  async (req,res)=>{  
    res.render("register");
})



app.post("/register",async (req,res)=>{

    console.log("app.post request trigered");

    const { name,email,password }=req.body;
    let user = await User.findOne({email});
    if(user)
    {
      return res.redirect("/login")
    }

    const hashedPassword = await bcrypt.hash(password,10);

    //db mae save ho gya
    user = await User.create({
        name,
        email,
        password:hashedPassword,
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
    res.redirect("/");
})



app.post("/login", async (req,res)=>{
    const {email,password} = req.body;
    let user = await User.findOne({email}); 
    if(!user) return res.redirect("/register");

// const isMatch = user.password === password;

//bcrpt catch
const isMatch = await bcrypt.compare(password,user.password);

if(!isMatch ) return res.render("login",{email,message:" Incorrect Password"});
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
     res.redirect("/");
})

app.get("/logout",(req,res)=>{

    console.log("logout wla trigered");

    //cookie set of name token and any value like iamin
    res.cookie("token",null,{
        httpOnly:true,
        expires:new Date(Date.now())
    });
    res.redirect("/");
})


app.listen(5000,()=>{
    console.log("server is working")
})