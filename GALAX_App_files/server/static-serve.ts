import express from 'express';
import path from 'path';
import fs from 'fs';

export function setupStaticServing(app: express.Application) {
  const publicDir = path.join(process.cwd(), 'dist', 'public');
  
  console.log('🌐 Setting up static file serving...');
  console.log('📁 Public directory:', publicDir);
  
  // Check if public directory exists
  if (!fs.existsSync(publicDir)) {
    console.error('❌ Public directory does not exist:', publicDir);
    return;
  }
  
  // Serve static files
  app.use(express.static(publicDir));
  
  // Handle client-side routing - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
      res.status(404).json({ error: 'API endpoint not found' });
      return;
    }
    
    const indexPath = path.join(publicDir, 'index.html');
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      console.error('❌ index.html not found at:', indexPath);
      res.status(404).send('Application not built. Please run build command.');
    }
  });
  
  console.log('✅ Static file serving configured');
}
