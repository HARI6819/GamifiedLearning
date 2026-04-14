import Navbar from "./Navbar";
import './Home.css'

import Pillars from "./Pillars";
import GameFormats from "./GameFormats";
import Footer from "./Footer";
import Learn from "./Learn";
import HeroPage from "./HeroPage";



function Home() {

   
    return (
        <>

            <section  className="section1">
                <Navbar />
            </section>

            
            
                <section>
                    <HeroPage />
                </section>
                
           
            <section className="Section2">
                <Pillars />
            </section>

            <section>
                <GameFormats />
            </section>

            <section>
                <Footer />
            </section>

        </>
    )
}


export default Home