import { ConnectButton } from "@web3uikit/web3"
//import ImgLogo from "/public/Logo.png"

export default function Header() {
    return <>
      <div class=" bg-[#102039] grid grid-cols-3 p-5 w-screen">
             <img className="p-4 h-24" rel="icon" type="image/png" href="logo.png" src='/Logo.png' alt="logo"></img>
          <div class="text-slate-50 text-center py-8 pr-9 text-4xl font-serif"> BlockFi </div>
         <div><ConnectButton class="flex justify-end my-6 mr-3" moralisAuth={false} /></div>
       </div>
    </>
}