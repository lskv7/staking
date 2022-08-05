import '../styles/globals.css'
import { MoralisProvider } from "react-moralis"
import Imgexp from "/styles/Expliimg.png"


function MyApp({ Component, pageProps }) {
  return (
    <><MoralisProvider initializeOnMount={false}>
      <Component {...pageProps} />
    </MoralisProvider>
             <img className="p-8" rel="icon" type="png" href="Expliimg.png" src={ Imgexp } alt="explimg"></img>
  </>
  )
}

export default MyApp
