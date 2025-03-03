import { useState } from "react";

export default function Login(){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      return;
    }
    alert(``);
  };

  return (
    <>
      <div className = "login-page">
        <div style = { { display : "flex", flexDirection : "column", alignItems : "center", marginBottom : "40px" } }>
            {/* <img className = "login-logo" src = { process.env.PUBLIC_URL + '/logo.png' } width = "180" height = "180"/> */}
            <h1 className = "login-title">Basket Stats</h1>
        </div>

        <div className = "login-container">
          <input type = "email" placeholder = "Email" value = { email } onChange = { (e) => setEmail(e.target.value) }/>
          <input type = "password" placeholder = "Password" value = { password } onChange={ (e) => setPassword(e.target.value) }/>
          
          <button onClick = { handleLogin } className = "login-button">Login</button>
        </div>
      </div>

      {/* <span className = "login-graphics" style = { { width : "30%", height : "50%"} }></span> */}
    </>
  );
}