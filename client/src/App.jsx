// // import reactLogo from './assets/react.svg'
// // import viteLogo from '/vite.svg'
// import React from 'react'
import './App.css'

// function App() {
//   // const [count, setCount] = useState(0);
//   const JSONDATA = [
//     {
//       name: "maddy",
//       ph: '987654310'
//     },
//     {
//       name: "mani",
//       ph: '0321654987'
//     }
//   ]

//   return (
//     <>
//       <p>hi guys</p>
//       <hr />
//       <br />
//       {
//         JSONDATA.map((data, index) => {
//           return (
//             <div key={index}>
//               <div className=''>
//                 <p>Name:</p>
//                 <p>{data.name}</p>
//               </div>
//               <div className=''>
//                 <p>Phone:</p>
//                 <p>{data.ph}</p>
//               </div>
//               <hr />
//             </div>
//           )
//         })

//       }

//     </>
//   )
// }

// export default App

import axios from "axios";
import { useState } from "react";

const App = () => {
  const [data, setData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const registerhandler = () => {
    // const name = document.getElementById("name").value;
    // const phone = document.getElementById("phone").value;
    // const email = document.getElementById("email").value;
    // const password = document.getElementById("password").value;
     if(data){

       axios
         .post("http://localhost:8080/user/create", {
           name: data.name,
           email: data.email,
           password: data.password,
           phone: data.phone,
         })
         .then((response) => {
           console.log("response: ", response);
           
         })
         .catch((error) => {
           console.log("error: ", error);
         });
     }
 
  };

  const valueChangeHandler = (event)=> {
    console.log(event.target.id);
    const eventId =  event.target.id;
    const eventValue = event.target.value;
    setData((prev)=>( {...prev, [eventId] : eventValue}));
  };
  return (
    <>
    <div className="dummy">
    <div className="row">
        <label>Name</label>
        <input id="name" type="text" value={data.name} onChange={valueChangeHandler} />
      </div>
      <div className="row">
        <label>Phone</label>
        <input type="text" id="phone" value={data.phone}  onChange={valueChangeHandler}/>
      </div>
      <div className="row">
        <label>Email</label>
        <input type="text" id="email" value={data.email}  onChange={valueChangeHandler}/>
      </div>
      <div className="row">
        <label>Password</label>
        <input type="text" id="password" value={data.password}  onChange={valueChangeHandler}/>
      </div>
      <button type="submit" onClick={registerhandler}>
        Register
      </button>

    </div>
    
        </>
  );
};

export default App;
