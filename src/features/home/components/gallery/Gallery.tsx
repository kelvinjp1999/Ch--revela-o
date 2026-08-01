import './Gallery.css'
import photo1 from '../../../../assets/images/Hero.png'
import photo2 from '../../../../assets/images/photo2.jpeg'

const Gallery = () => {
  return (
     <section className="gallery">

      <div className="gallery-item">
        <img src={photo1} alt="Foto 1" />
      </div>

      <div className="gallery-item">
        <img src={photo2} alt="Foto 2" />
      </div>

      <div className="gallery-item">
        <img src={photo1} alt="Foto 3" />
      </div>

    </section>
  )
}

export default Gallery
