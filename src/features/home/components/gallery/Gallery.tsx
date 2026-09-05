import './Gallery.css'
import photo1 from '../../../../assets/images/img1.jpeg'
import photo2 from '../../../../assets/images/img2.jpeg'
import photo3 from '../../../../assets/images/img3.jpeg'

const Gallery = () => {
  return (
     <section className="gallery">
      <div className="gallery-heading">
        <p>Nossa história em detalhes</p>
        <h2>Um pouco de nós</h2>
      </div>

      <div className="gallery-item gallery-item-tall">
        <img src={photo1} alt="Foto 1" />
      </div>

      <div className="gallery-item gallery-item-middle">
        <img src={photo2} alt="Foto 2" />
      </div>

      <div className="gallery-item gallery-item-tall">
        <img src={photo3} alt="Foto 3" />
      </div>

    </section>
  )
}

export default Gallery
