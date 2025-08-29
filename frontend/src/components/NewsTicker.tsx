import React, { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';

interface Article {
  title: string;
  description: string;
  url: string;
  image?: string;
}

const NewsTicker: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('http://localhost:8083/newsfeed/news');
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const data = await response.json();
        const items = Array.isArray(data?.articles) ? data.articles : [];
        setArticles(items);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-background to-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Latest Crime News</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Stay informed with the latest crime news and updates from around Sri Lanka.
            </p>
          </div>
          <div className="text-center">
            <div className="animate-pulse">Loading news...</div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-b from-background to-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Latest Crime News</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Stay informed with the latest crime news and updates from around Sri Lanka.
            </p>
          </div>
          <div className="text-center text-red-500">
            Error loading news: {error}
          </div>
        </div>
      </section>
    );
  }

  if (!articles.length) {
    return (
      <section className="py-20 bg-gradient-to-b from-background to-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Latest Crime News</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Stay informed with the latest crime news and updates from around Sri Lanka.
            </p>
          </div>
          <div className="text-center text-muted-foreground">
            No crime news available at the moment.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Latest Crime News</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stay informed with the latest crime news and updates from around Sri Lanka.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.slice(0, 6).map((article, idx) => (
            <a
              key={idx}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card-crime p-6 group hover:shadow-glow transition-all duration-300 block"
              title={article.title}
            >
              <div className="w-full h-48 mb-4 overflow-hidden rounded-lg bg-muted">
                {article.image ? (
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
                    <div className="text-muted-foreground text-sm">No Image</div>
                  </div>
                )}
              </div>

              <h3 className="text-xl font-semibold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                {article.title}
              </h3>

              {article.description && (
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {article.description}
                </p>
              )}

              <div className="flex items-center text-primary text-sm font-medium group-hover:text-primary/80 transition-colors">
                <span>Read More</span>
                <ExternalLink className="h-4 w-4 ml-2" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsTicker;
