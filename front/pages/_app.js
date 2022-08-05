import '../styles/globals.css'
import { MoralisProvider } from "react-moralis"
// import Imgexp from "../pages/Expliimg.png"


function MyApp({ Component, pageProps }) {
  return (
    <><MoralisProvider initializeOnMount={false}>
      <Component {...pageProps} />
    </MoralisProvider>
             <img className="p-4 h-2/3 object-center " rel="icon" type="png" href="Expliimg.png" src= '/Expliimg.png'  alt="explimg"></img>
  </>
  )
}

export default MyApp
