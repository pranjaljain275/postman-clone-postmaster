document.querySelector(".btn").addEventListener("click",register)


async function register(event){
    event.preventDefault()
    try{
        let email=document.querySelector("#email").value
        let username=document.querySelector("#username").value
        let password=document.querySelector("#password").value

        let regdata={
            username,email,password
        }
        let regurl="http://localhost:7575/user/signup"

        let res=await fetch(regurl,{
            method:"POST",
            body:JSON.stringify(regdata),
            headers:{
                "Content-type":"application/json"
            }
        })
        let data=await res.json()

        alert(data.msg)
        console.log(data)
    }catch(err){
        console.log(err)
    }
        


}
