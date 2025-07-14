import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  FlatList,
  Linking,
  Alert
} from 'react-native';
import axios from 'axios';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  imageUrl: string;
  url: string; // Added URL field for the original article
}

const MarketNewsSection: React.FC = () => {
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [marketNews, setMarketNews] = useState<NewsItem[]>([]);

  const fetchMarketNews = async () => {
    setNewsLoading(true);
    setNewsError(null);

    try {
      // Using RSS2JSON service to parse real financial RSS feeds (no API key required)
      const rssFeeds = [
        {
          url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms',
          source: 'Economic Times'
        },
        {
          url: 'https://www.moneycontrol.com/rss/results.xml',
          source: 'MoneyControl'
        },
        {
          url: 'https://feeds.bloomberg.com/markets/news.rss',
          source: 'Bloomberg'
        }
      ];

      let newsData = null;

      // Try each RSS feed until one works
      for (const feed of rssFeeds) {
        try {
          console.log(`Trying RSS feed: ${feed.source}`);
          const rssResponse = await axios.get(
            `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}&count=10`,
            { timeout: 10000 }
          );

          if (rssResponse.data && rssResponse.data.items && rssResponse.data.items.length > 0) {
            newsData = rssResponse.data.items.map((item: any, index: number) => ({
              id: `${feed.source}-${index}`,
              title: item.title || 'No title available',
              summary: item.description
                ? item.description.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
                : item.content?.replace(/<[^>]*>/g, '').substring(0, 200) + '...' || 'No description available',
              source: feed.source,
              date: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : new Date().toLocaleDateString(),
              imageUrl: item.thumbnail || item.enclosure?.link || `https://via.placeholder.com/100?text=${feed.source}`,
              url: item.link || item.guid || ''
            })).filter(item => item.url && item.title !== 'No title available');

            if (newsData.length > 0) {
              console.log(`Successfully fetched ${newsData.length} articles from ${feed.source}`);
              break;
            }
          }
        } catch (feedError) {
          console.log(`Failed to fetch from ${feed.source}:`, feedError.message);
          continue;
        }
      }

      // If RSS feeds fail, try alternative free news API
      if (!newsData || newsData.length === 0) {
        try {
          console.log('RSS feeds failed, trying alternative API...');
          // Using a free news aggregator API
          const altResponse = await axios.get(
            'https://saurav.tech/NewsAPI/top-headlines/category/business/in.json',
            { timeout: 10000 }
          );

          if (altResponse.data && altResponse.data.articles) {
            newsData = altResponse.data.articles.slice(0, 8).map((item: any, index: number) => ({
              id: `alt-${index}`,
              title: item.title || 'No title available',
              summary: item.description || item.content?.substring(0, 200) + '...' || 'No description available',
              source: item.source?.name || 'Business News',
              date: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : new Date().toLocaleDateString(),
              imageUrl: item.urlToImage || 'https://via.placeholder.com/100?text=News',
              url: item.url || ''
            })).filter(item => item.url);

            console.log(`Fetched ${newsData.length} articles from alternative API`);
          }
        } catch (altError) {
          console.log('Alternative API also failed:', altError.message);
        }
      }

      if (newsData && newsData.length > 0) {
        setMarketNews(newsData);
        console.log('Successfully loaded real news data');
      } else {
        throw new Error('All news sources failed');
      }
    } catch (error) {
      console.error('Error fetching market news:', error);
      setNewsError('Unable to load real-time news. Please check your internet connection and try again.');

      // Only show error, no fallback fake data since user wants real data only
      setMarketNews([]);
    } finally {
      setNewsLoading(false);
    }
  };

  // Add a manual refresh function
  const handleRefreshNews = () => {
    fetchMarketNews();
  };

  // Function to open article URL
  const handleNewsItemPress = async (newsItem: NewsItem) => {
    if (!newsItem.url) {
      Alert.alert('No Link Available', 'This article does not have a link to the original source.');
      return;
    }

    try {
      const supported = await Linking.canOpenURL(newsItem.url);

      if (supported) {
        await Linking.openURL(newsItem.url);
      } else {
        Alert.alert(
          'Cannot Open Link',
          'Unable to open this article. The link may be invalid or your device cannot handle this type of URL.',
          [
            {
              text: 'Copy Link',
              onPress: () => {
                // You can add clipboard functionality here if needed
                Alert.alert('Link', newsItem.url);
              }
            },
            { text: 'OK' }
          ]
        );
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert(
        'Error',
        'Failed to open the article. Please try again.',
        [
          {
            text: 'Copy Link',
            onPress: () => {
              Alert.alert('Link', newsItem.url);
            }
          },
          { text: 'OK' }
        ]
      );
    }
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
    <TouchableOpacity
      style={styles.newsItem}
      onPress={() => handleNewsItemPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle}>{item.title}</Text>
        <Text style={styles.newsSummary} numberOfLines={3}>{item.summary}</Text>
        <View style={styles.newsFooter}>
          <Text style={styles.newsSource}>{item.source}</Text>
          <Text style={styles.newsDate}>{item.date}</Text>
        </View>
        {/* Add a visual indicator that the item is clickable */}
        <View style={styles.clickIndicator}>
          <Text style={styles.clickIndicatorText}>Tap to read full article →</Text>
        </View>
      </View>
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.newsImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
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
          <Text style={styles.loadingText}>Loading real-time market news...</Text>
        </View>
      ) : newsError || marketNews.length === 0 ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {newsError || 'No real-time news available at the moment'}
          </Text>
          <Text style={styles.errorSubtext}>
            We only show real, current financial news. Please check your internet connection and try again.
          </Text>
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
    fontSize: 16,
    color: '#e53935',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
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
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
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
  clickIndicator: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  clickIndicatorText: {
    fontSize: 12,
    color: '#7F00FF',
    fontWeight: '500',
    fontStyle: 'italic',
  },
});

export default MarketNewsSection;
