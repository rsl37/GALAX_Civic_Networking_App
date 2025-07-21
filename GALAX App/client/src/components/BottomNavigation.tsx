import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, HandHeart, AlertTriangle, Vote, User, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/help', icon: HandHeart, label: 'Help' },
    { path: '/crisis', icon: AlertTriangle, label: 'Crisis' },
    { path: '/stablecoin', icon: DollarSign, label: 'Coin' },
    { path: '/governance', icon: Vote, label: 'Gov' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const handleNavigation = (path: string) => {
    console.log('Navigating to:', path);
    navigate(path);
  };

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-purple-200 galax-glass z-50"
    >
      <div className="flex justify-around items-center py-2 px-4">
        {navItems.map(({ path, icon: Icon, label }, index) => (
          <Button
            key={path}
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center gap-1 h-auto py-2 px-3 transition-all duration-200 ${
              location.pathname === path 
                ? 'text-purple-600 bg-purple-50' 
                : 'text-gray-600 hover:text-purple-600'
            }`}
            onClick={() => handleNavigation(path)}
          >
            <motion.div
              animate={{ 
                scale: location.pathname === path ? 1.1 : 1,
                rotate: location.pathname === path ? [0, 5, -5, 0] : 0
              }}
              transition={{ duration: 0.3 }}
            >
              <Icon className="h-5 w-5" />
            </motion.div>
            <span className="text-xs font-medium">{label}</span>
            {location.pathname === path && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-1 h-1 bg-purple-600 rounded-full"
              />
            )}
          </Button>
        ))}
      </div>
    </motion.div>
  );
}
