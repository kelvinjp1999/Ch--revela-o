import "./Gifts.css";

import { useState } from "react";
import { FiGrid, FiCoffee, FiHome, FiCpu } from "react-icons/fi";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import GiftsHero from "../../components/GiftsHero/GiftsHero";

const gifts = [
  {
    id: 1,
    nome: "Air Fryer",
    categoria: "eletros",
    valor: 450,
    cotas: 5,
    compradas: 0,
    imagem: "https://picsum.photos/600/400?1",
  },
  {
    id: 2,
    nome: "Batedeira Planetária",
    categoria: "eletros",
    valor: 890,
    cotas: 6,
    compradas: 2,
    imagem: "https://picsum.photos/600/400?2",
  },
  {
    id: 3,
    nome: "Jogo de Panelas",
    categoria: "cozinha",
    valor: 650,
    cotas: 5,
    compradas: 1,
    imagem: "https://picsum.photos/600/400?3",
  },
  {
    id: 4,
    nome: "Liquidificador",
    categoria: "cozinha",
    valor: 320,
    cotas: 4,
    compradas: 3,
    imagem: "https://picsum.photos/600/400?4",
  },
  {
    id: 5,
    nome: "Aparelho de Jantar",
    categoria: "casa",
    valor: 580,
    cotas: 5,
    compradas: 1,
    imagem: "https://picsum.photos/600/400?5",
  },
  {
    id: 6,
    nome: "Robô Aspirador",
    categoria: "casa",
    valor: 1450,
    cotas: 10,
    compradas: 5,
    imagem: "https://picsum.photos/600/400?6",
  },
];

function Gifts() {
  const [categoria, setCategoria] = useState("todos");

  const presentes =
    categoria === "todos"
      ? gifts
      : gifts.filter((gift) => gift.categoria === categoria);

  return (
    <>
      <Header />

      <GiftsHero />

      <section className="gift-container">

        {/* CATEGORIAS */}

        <div className="gift-categories">

          <button
            className={categoria === "todos" ? "active" : ""}
            onClick={() => setCategoria("todos")}
          >
            <FiGrid />
            TODOS
          </button>

          <button
            className={categoria === "cozinha" ? "active" : ""}
            onClick={() => setCategoria("cozinha")}
          >
            <FiCoffee />
            COZINHA
          </button>

          <button
            className={categoria === "eletros" ? "active" : ""}
            onClick={() => setCategoria("eletros")}
          >
            <FiCpu />
            ELETROS
          </button>

          <button
            className={categoria === "casa" ? "active" : ""}
            onClick={() => setCategoria("casa")}
          >
            <FiHome />
            CASA
          </button>

        </div>

        {/* GRID */}

        <div className="gift-grid">

          {presentes.map((gift) => (

            <div className="gift-card" key={gift.id}>

              <img src={gift.imagem} alt={gift.nome} />

              <div className="gift-content">

                <h2>{gift.nome}</h2>

                <span className="price">
                  R$ {gift.valor.toFixed(2)}
                </span>

                <div className="gift-progress">

                  <span>
                    {gift.compradas}/{gift.cotas} cotas
                  </span>

                  <div className="progress">

                    <div
                      className="progress-fill"
                      style={{
                        width: `${(gift.compradas / gift.cotas) * 100}%`,
                      }}
                    ></div>

                  </div>

                </div>

                <button>
                  ESCOLHER COTA
                </button>

              </div>

            </div>

          ))}

        </div>

        {/* CONTRIBUIÇÃO LIVRE */}

        <div className="free-card">

          <div className="heart">
            ❤
          </div>

          <div>

            <h2>
              Prefere contribuir com um valor livre?
            </h2>

            <p>
              Qualquer contribuição será muito bem-vinda para
              nos ajudar a construir nosso novo lar.
            </p>

          </div>

          <button>
            CONTRIBUIR
          </button>

        </div>

      </section>

      <Footer />
    </>
  );
}

export default Gifts;