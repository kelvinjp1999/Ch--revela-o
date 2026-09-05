import './About.css'
import casaImage from '../../../../assets/images/casa.png'


const About = () => {
  return (
        <section className="about">
            <img className="about-background" src={casaImage} alt="" aria-hidden="true" />
            <div className="about-content">
                <h2>Nossa História</h2>

                <p>
                Nossa nova história está começando, e sua presença é o ingrediente que não pode faltar
                </p>
                <p className="about-prayer">“Tudo aqui já foi uma oração.”</p>
            </div>
        </section>
  )
}

export default About
