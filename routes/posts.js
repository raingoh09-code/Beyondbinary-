const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { posts, users, saveData } = require('../data/database');
const { authenticateToken } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|wmv|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  }
});

// Get all posts
router.get('/', (req, res) => {
  try {
    // Sort posts by creation date (newest first)
    const sortedPosts = posts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(post => {
        // Add user information to each post
        const user = users.find(u => u.id === post.userId);
        return {
          ...post,
          author: user ? {
            id: user.id,
            name: user.name || user.username,
            email: user.email
          } : {
            id: post.userId,
            name: 'Unknown User',
            email: ''
          }
        };
      });
    
    res.json(sortedPosts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single post
router.get('/:id', (req, res) => {
  try {
    const post = posts.find(p => p.id === req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Add user information
    const user = users.find(u => u.id === post.userId);
    const postWithAuthor = {
      ...post,
      author: user ? {
        id: user.id,
        name: user.name || user.username,
        email: user.email
      } : {
        id: post.userId,
        name: 'Unknown User',
        email: ''
      }
    };
    
    res.json(postWithAuthor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new post
router.post('/', authenticateToken, upload.single('media'), (req, res) => {
  try {
    const { content, type = 'text' } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Content is required' });
    }
    
    const newPost = {
      id: Date.now().toString(),
      userId: req.user.userId,
      content: content.trim(),
      type: type,
      likes: [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // If there's a file upload, add media information
    if (req.file) {
      newPost.media = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: `/uploads/${req.file.filename}`
      };
      
      // Determine media type
      if (req.file.mimetype.startsWith('image/')) {
        newPost.type = 'photo';
      } else if (req.file.mimetype.startsWith('video/')) {
        newPost.type = 'video';
      }
    }
    
    posts.push(newPost);
    saveData();
    
    // Return post with author info
    const user = users.find(u => u.id === req.user.userId);
    const responsePost = {
      ...newPost,
      author: {
        id: user.id,
        name: user.name || user.username,
        email: user.email
      }
    };
    
    res.status(201).json({ 
      message: 'Post created successfully', 
      post: responsePost 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Like/unlike a post
router.post('/:id/like', authenticateToken, (req, res) => {
  try {
    const post = posts.find(p => p.id === req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const userId = req.user.userId;
    const likeIndex = post.likes.indexOf(userId);
    
    if (likeIndex === -1) {
      // Like the post
      post.likes.push(userId);
    } else {
      // Unlike the post
      post.likes.splice(likeIndex, 1);
    }
    
    post.updatedAt = new Date().toISOString();
    saveData();
    
    res.json({ 
      message: likeIndex === -1 ? 'Post liked' : 'Post unliked',
      likes: post.likes.length,
      isLiked: likeIndex === -1
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add comment to post
router.post('/:id/comment', authenticateToken, (req, res) => {
  try {
    const post = posts.find(p => p.id === req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const { content } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }
    
    const newComment = {
      id: Date.now().toString(),
      userId: req.user.userId,
      content: content.trim(),
      createdAt: new Date().toISOString()
    };
    
    post.comments.push(newComment);
    post.updatedAt = new Date().toISOString();
    saveData();
    
    // Add user info to comment
    const user = users.find(u => u.id === req.user.userId);
    const responseComment = {
      ...newComment,
      author: {
        id: user.id,
        name: user.name || user.username,
        email: user.email
      }
    };
    
    res.status(201).json({ 
      message: 'Comment added successfully',
      comment: responseComment 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete post (only by author)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const postIndex = posts.findIndex(p => p.id === req.params.id);
    if (postIndex === -1) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const post = posts[postIndex];
    if (post.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    
    posts.splice(postIndex, 1);
    saveData();
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;