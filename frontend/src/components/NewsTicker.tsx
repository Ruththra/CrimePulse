import React, { useState, useEffect } from 'react';

interface Article {
  title: string;
  description: string;
  url: string;
  image: string; // Added the image field to the interface
}

const NewsFeed: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Function to fetch the news from the backend
    const fetchNews = async () => {
      try {
        const response = await fetch('http://localhost:8083/newsfeed/news');
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const data = await response.json();
        setArticles(data.articles); // Assuming the data follows the same structure returned by the backend
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="news-feed">
      <h1>Crime News from Sri Lanka</h1>
      <div className="articles-grid">
        {articles.length > 0 ? (
          articles.map((article, index) => (
            <div key={index} className="article">
              {/* Conditionally render the image if it exists */}
              {article.image && (
                <img
                  src={article.image}
                  alt={article.title}
                  className="article-image"
                />
              )}
              <h2>{article.title}</h2>
              <p>{article.description}</p>
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="read-more-link">
                Read more
              </a>
            </div>
          ))
        ) : (
          <p>No crime news available</p>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;
