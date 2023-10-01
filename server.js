const express = require('express');
const axios = require('axios');
const _ = require('lodash');
const app = express();



const getBlogData = _.memoize(async () => {
    try {
      const response = await axios.get('https://intent-kit-16.hasura.app/api/rest/blogs', {
        headers: {
          'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }, () => 'cacheKey', 600000);


app.get('/api/blog-stats', async (req, res) => {
    try {
      const response = await axios.get('https://intent-kit-16.hasura.app/api/rest/blogs', {
        headers: {
          'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
        }
      });
      const blogs = response.data;

   
      const totalBlogs = blogs.length;
      const longestBlog = _.maxBy(blogs, 'title.length');
      const blogsWithPrivacy = _.filter(blogs, blog => blog?.title?.toLowerCase().includes('privacy'));
      const uniqueTitles = _.uniqBy(blogs, 'title').map(blog => blog?.title);
  
      // Permforming sentiment analysis on title to get a score wether it is good or bad
      const sentimentScores = blogs.map(blog => sentiment(blog.title));
    const averageSentimentScore = _.meanBy(sentimentScores, 'score');
      
      res.json({
        totalBlogs,
        longestBlog: longestBlog.title,
        blogsWithPrivacy: blogsWithPrivacy.length,
        uniqueTitles,
        averageSentimentScore
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/blog-search', (req, res) => {
    const query = req.query.query.toLowerCase();
    
    const blogs = getBlogData();
    const searchResults = blogs.filter(blog => blog.title.toLowerCase().includes(query));
    res.json(searchResults);
  });
  
  
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  });
  
  app.listen(3000, () => {
    console.log(`Server is running on port ${3000}`);
  });