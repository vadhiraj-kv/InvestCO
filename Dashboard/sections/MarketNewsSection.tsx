import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  FlatList
} from 'react-native';
import axios from 'axios';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  imageUrl: string;
}

const MarketNewsSection: React.FC = () => {
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [marketNews, setMarketNews] = useState<NewsItem[]>([]);

  const fetchMarketNews = async () => {
    setNewsLoading(true);
    setNewsError(null);
    
    try {
      const API_KEY = '2ERYE9DMYCK02SJG';
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=financial_markets,economy&apikey=${API_KEY}`
      );
      
      if (response.data && response.data.feed) {
        const formattedNews = response.data.feed.map((item: any, index: number) => ({
          id: index.toString(),
          title: item.title,
          summary: item.summary,
          source: item.source,
          date: new Date(item.time_published).toLocaleDateString(),
          imageUrl: item.banner_image || 'https://via.placeholder.com/100'
        }));
        
        setMarketNews(formattedNews.slice(0, 10));
      } else {
        setNewsError('No news data available');
        // Fallback data
        setMarketNews([
          {
            id: '1',
            title: 'RBI Keeps Repo Rate Unchanged at 6.5%',
            summary: 'The Reserve Bank of India (RBI) maintained the repo rate at 6.5% for the seventh consecutive time, focusing on inflation control.',
            source: 'Economic Times',
            date: '2023-06-08',
            imageUrl: 'https://via.placeholder.com/100'
          },
          {
            id: '2',
            title: 'Sensex Hits New All-Time High, Crosses 74,000',
            summary: 'Indian markets reached a new milestone as Sensex crossed 74,000 for the first time, driven by strong FII inflows and positive global cues.',
            source: 'Business Standard',
            date: '2023-06-07',
            imageUrl: 'https://via.placeholder.com/100'
          },
          {
            id: '3',
            title: 'IT Sector Shows Signs of Recovery as Hiring Increases',
            summary: 'After a year of layoffs and hiring freezes, the IT sector is showing signs of recovery with major companies resuming campus placements.',
            source: 'Mint',
            date: '2023-06-06',
            imageUrl: 'https://via.placeholder.com/100'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching market news:', error);
      setNewsError('Failed to load market news');
      
      // Fallback data
      setMarketNews([
        {
          id: '1',
          title: 'RBI Keeps Repo Rate Unchanged at 6.5%',
          summary: 'The Reserve Bank of India (RBI) maintained the repo rate at 6.5% for the seventh consecutive time, focusing on inflation control.',
          source: 'Economic Times',
          date: '2023-06-08',
          imageUrl: 'https://via.placeholder.com/100'
        },
        {
          id: '2',
          title: 'Sensex Hits New All-Time High, Crosses 74,000',
          summary: 'Indian markets reached a new milestone as Sensex crossed 74,000 for the first time, driven by strong FII inflows and positive global cues.',
          source: 'Business Standard',
          date: '2023-06-07',
          imageUrl: 'https://via.placeholder.com/100'
        },
        {
          id: '3',
          title: 'IT Sector Shows Signs of Recovery as Hiring Increases',
          summary: 'After a year of layoffs and hiring freezes, the IT sector is showing signs of recovery with major companies resuming campus placements.',
          source: 'Mint',
          date: '2023-06-06',
          imageUrl: 'https://via.placeholder.com/100'
        }
      ]);
    } finally {
      setNewsLoading(false);
    }
  };

  // Add a manual refresh function
  const handleRefreshNews = () => {
    fetchMarketNews();
  };

  // Fetch news when component mounts
  useEffect(() => {
    fetchMarketNews();
    
    // Refresh news every 30 minutes
    const intervalId = setInterval(fetchMarketNews, 30 * 60 * 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  const renderNewsItem = ({ item }: { item: NewsItem }) => (
    <View style={styles.newsItem}>
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle}>{item.title}</Text>
        <Text style={styles.newsSummary} numberOfLines={3}>{item.summary}</Text>
        <View style={styles.newsFooter}>
          <Text style={styles.newsSource}>{item.source}</Text>
          <Text style={styles.newsDate}>{item.date}</Text>
        </View>
      </View>
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.newsImage}
        resizeMode="cover"
      />
    </View>
  );

  return (
    <View style={styles.marketNewsContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Market News & Updates</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefreshNews}
          disabled={newsLoading}
        >
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
      
      {newsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7F00FF" />
          <Text style={styles.loadingText}>Loading market news...</Text>
        </View>
      ) : newsError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{newsError}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRefreshNews}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={marketNews}
          renderItem={renderNewsItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.newsList}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  marketNewsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    backgroundColor: '#7F00FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: '#e53935',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#7F00FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  newsList: {
    gap: 16,
  },
  newsItem: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  newsContent: {
    flex: 1,
    padding: 12,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  newsSummary: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  newsSource: {
    fontSize: 12,
    color: '#7F00FF',
    fontWeight: '500',
  },
  newsDate: {
    fontSize: 12,
    color: '#999',
  },
  newsImage: {
    width: 100,
    height: '100%',
  },
});

export default MarketNewsSection;
