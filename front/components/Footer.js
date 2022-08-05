import React from "react";
//import Alyralogo from "/public/Alyralogo.png"
//import Copyright from "/public/Copyright.png"


function Footer() {
    return (
      <div className="flex">
        <img className="p-4 h-2/3 object-center flex-start" rel="icon" type="png" src= '/Alyralogo.png'  alt=""></img>
        <img className="p-4 h-2/3 object-center flex-end" rel="icon" type="png" src= '/Copyright.png'  alt=""></img>
      </div>
    );
  }
export default Footer;