import "./Header.css";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { FiCheck, FiCoffee, FiHeart, FiUser, FiX } from "react-icons/fi";
import HeartIcon from "../../ui/HeartIcon";
import { supabase } from "../../../lib/supabase";

function Header() {
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const closeConfirmation = () => {
    setIsConfirmationOpen(false);
    setIsConfirmed(false);
    setError("");
  };

  useEffect(() => {
    if (!isConfirmationOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeConfirmation();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isConfirmationOpen]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!guestName.trim()) return;

    if (!supabase) {
      setError("A confirmação não está configurada neste site. Tente novamente após a publicação ser atualizada.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const { error: requestError } = await supabase.rpc("register_guest", { p_name: guestName.trim() });
      if (requestError) {
        setError("Não conseguimos confirmar agora. Tente novamente em instantes.");
        return;
      }

      setIsConfirmed(true);
    } catch {
      setError("Não conseguimos confirmar agora. Tente novamente em instantes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header className="header">
        <Link to="/" className="logo" aria-label="Página inicial">
          <HeartIcon />
        </Link>

        <nav className="menu">
          <Link to="/">Início</Link>
          <Link to="/gifts">Presentes</Link>
        </nav>

        <button className="btn-confirmar" onClick={() => setIsConfirmationOpen(true)}>
          Confirmar Presença
        </button>
      </header>

      {isConfirmationOpen && (
        <div
          className="presence-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeConfirmation();
          }}
        >
          <section className="presence-modal" role="dialog" aria-modal="true" aria-labelledby="presence-title">
            <button className="presence-close" onClick={closeConfirmation} aria-label="Fechar confirmação de presença">
              <FiX />
            </button>

            {isConfirmed ? (
              <div className="presence-success">
                <span className="presence-icon"><FiCheck /></span>
                <p className="presence-eyebrow">Tudo anotado!</p>
                <h2 id="presence-title">Que alegria ter você com a gente, {guestName.trim()}!</h2>
                <p>Vamos deixar um lugar especial à mesa — e o café bem quentinho. ☕</p>
                <button className="presence-submit" onClick={closeConfirmation}>Até lá!</button>
              </div>
            ) : (
              <>
                <span className="presence-icon"><FiCoffee /></span>
                <p className="presence-eyebrow">Chá de casa nova</p>
                <h2 id="presence-title">Vai ter um cantinho para você?</h2>
                <p className="presence-text">Conte pra gente quem vai brindar esse novo capítulo ao nosso lado.</p>

                <form className="presence-form" onSubmit={handleSubmit}>
                  <label htmlFor="guest-name">Como podemos te chamar?</label>
                  <div className="presence-input-wrap">
                    <FiUser aria-hidden="true" />
                    <input id="guest-name" type="text" value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Seu nome" autoFocus required />
                  </div>
                  <button className="presence-submit" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Confirmando..." : <>Confirmar com carinho <FiHeart aria-hidden="true" /></>}
                  </button>
                  {error && <p className="presence-error" role="alert">{error}</p>}
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}

export default Header;
