import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const App = () => {
  const [posts, setPosts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false); // Gérer le chargement des nouveaux posts
  const [theme, setTheme] = useState(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  useEffect(() => {
    const rssFeedUrl = "https://www.lemonde.fr/rss/une.xml";

    const fetchRSS = async () => {
      try {
        const response = await fetch(
          `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssFeedUrl)}`
        );
        const data = await response.json();
        if (data.items) {
          setPosts(data.items);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du flux RSS :", error);
      }
    };

    fetchRSS();

    const mediaQueryListener = (e) => {
      setTheme(e.matches ? "dark" : "light");
    };

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", mediaQueryListener);

    return () => {
      mediaQuery.removeEventListener("change", mediaQueryListener);
    };
  }, []);

  // Fonction pour récupérer les éléments RSS avec pagination
  const fetchRSSWithPagination = async (page = 1) => {
    const rssFeedUrl = `https://www.lemonde.fr/rss/une.xml`;

    try {
      const response = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssFeedUrl)}`
      );
      const data = await response.json();
      if (data.items) {
        setPosts((prevPosts) => [...prevPosts, ...data.items]); // Ajouter les nouveaux éléments à la liste existante
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du flux RSS :", error);
    }
  };

  useEffect(() => {
    fetchRSSWithPagination(); // Charger les premiers éléments au démarrage
  }, []);

  // Gérer le début du glissement tactile
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  // Gérer le mouvement tactile
  const handleTouchMove = (e) => {
    touchEndY.current = e.touches[0].clientY;
  };

  // Gérer la fin du glissement tactile
  const handleTouchEnd = () => {
    const deltaY = touchStartY.current - touchEndY.current;

    // Scroll vers le bas si on a glissé vers le bas
    if (deltaY > 50 && currentIndex < posts.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
    // Scroll vers le haut si on a glissé vers le haut
    else if (deltaY < -50 && currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }

    // Si on arrive à la fin de la liste et que des nouveaux éléments sont à charger
    if (currentIndex === posts.length - 1 && !loading) {
      setLoading(true);
      fetchRSSWithPagination(Math.floor(posts.length / 10) + 1); // Charger la page suivante, basé sur la longueur actuelle
      setLoading(false);
    }
  };

  return (
    <div
      className="app-container"
      style={{
        height: "100vh",
        overflow: "hidden",
        fontFamily: "Futura, sans-serif",
        backgroundColor: theme === "dark" ? "#000000" : "#F5F5F5",
        color: theme === "dark" ? "#FFFFFF" : "#000000",
        transition: "background-color 0.3s, color 0.3s",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Petite box translucide en haut pour le titre */}
      <div
        className="header-box"
        style={{
          position: "absolute",
          top: "0",
          left: "50%",
          transform: "translateX(-50%)",
          height: "70px", // Hauteur de la box
          width: "88%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme === "dark" ? "#000000" : "#F5F5F5",
          color: theme === "dark" ? "#FFFFFF" : "#000000",
          fontSize: "1.8rem",
          fontWeight: "bold",
          borderRadius: "40px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
          zIndex: "10", // Assurer que la box soit au-dessus du contenu scrollable
          marginTop: "23px", // Ajustement pour la position de la box
        }}
      >
        Quantal Fast
      </div>

      {posts.length > 0 && (
        <div
          className="post-container"
          style={{
            display: "flex",
            flexDirection: "column",
            height: `${posts.length * 100}vh`,
            transition: "transform 0.5s ease-in-out",
            transform: `translateY(-${currentIndex * 100}vh)`,
          }}
        >
          {posts.map((post, index) => (
            <div
              key={index}
              className="post-content"
              style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                padding: "2rem",
                backgroundColor: theme === "dark" ? "#263238" : "#FFFFFF",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                borderRadius: "40px",
                backdropFilter: "blur(10px)",
                margin: "1rem",
              }}
            >
              <div>
                <h2
                  className="post-title"
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: "bold",
                    marginBottom: "1rem",
                  }}
                >
                  {post.title}
                </h2>
                <p
                  className="post-snippet"
                  style={{
                    fontSize: "1rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  {post.contentSnippet}
                </p>
                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="post-link"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "0.5rem 1rem",
                    backgroundColor: "#ABB2B9",
                    color: "#000000",
                    borderRadius: "30px",
                    textDecoration: "none",
                    fontSize: "1rem",
                    fontWeight: "500",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    transition: "background-color 0.2s ease",
                  }}
              
                >
                  Deep reading
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    style={{ width: "20px", height: "20px", marginLeft: "8px" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;